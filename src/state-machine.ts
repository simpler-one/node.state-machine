import {
    StateType, StateMachineItem, NamedState, StatechartWriter,
    Statechart, StatechartItem, StatechartTransition, OnLeaveState, OnEnterState
} from './interface';
import { StateChangedEvent, StateChangeFailedEvent } from './event-args';
import { MetaState, MetaStateAction as MetaAction, MetaStateAction } from './state-meta';
import { Subject, Observable } from 'rxjs';
import { StateHistory } from './state-history';
import { StartType, StartName } from './state-meta/meta-state';
import { LinkedStateType } from './linked-state-type';


type Item<S, A extends string, P> = StateMachineItem<StateType<S, A, P>, StateType<S, A, P>, A>;
type LooseStateType<S, A extends string, P> = StateType<S, A | undefined, P | void>;

export class StateMachine<S, A extends string, P = void> {

    //
    // Public var

    /** Current leaf state */
    public get current(): S | undefined {
        return this.curLeaf.instance;
    }
    /** Current top state */
    public get currentTop(): S | undefined {
        return this._current[0].instance;
    }
    /** Current states */
    public get currentStates(): S[] | [undefined] {
        return this._current.map(state => state.instance);
    }
    
    /** Histories */
    public get histories(): StateHistory<A>[] {
        return [...this._histories];
    }
    /** History capacity */
    public get historyCapacity(): number {
        return this._historyCapacity;
    }
    public set historyCapacity(capacity: number) {
        this._historyCapacity = capacity < 0 ? 0 : capacity;
        const over = this._histories.length - this._historyCapacity;
        if (over > 0) {
            this._histories.splice(0, over);
        }
    }

    //
    // Public event

    public get stateChanged(): Observable<StateChangedEvent<S, A, P>> {
        return this._stateChanged.asObservable();
    }
    public get stateChangeFailed(): Observable<StateChangeFailedEvent<S, A, P>> {
        return this._stateChangeFailed.asObservable();
    }


    private readonly map: Map<string, LinkedStateType<S, A, P>>;

    private _current: ActiveState<S, A, P>[];
    private _histories: StateHistory<A>[] = [];
    private _historyCapacity: number = 100;
    private get curLeaf(): ActiveState<S, A, P> {
        return this._current[this._current.length - 1];
    }

    private readonly _stateChanged: Subject<StateChangedEvent<S, A, P>> = new Subject();
    private readonly _stateChangeFailed: Subject<StateChangeFailedEvent<S, A, P>> = new Subject();

    protected constructor(
        public readonly name: string,
        start: StateType<S, A, P>,
        items: Item<S, A, P>[]
    ) {
        const anytimeI: number = items.findIndex(item => `${item.state}` === MetaState.AnytimeName);
        let anytimeActions: [A, StateType<S, A, P>][] = [];
        if (anytimeI >= 0) {
            anytimeActions = items.splice(anytimeI, 1)[0].transitions;
        }

        this.map = StateMachine.createMap(items, anytimeActions);

        const metaStart = new LinkedStateType<S, A, P>(StartType, undefined);
        this.map.set(MetaState.StartName, metaStart);
        let startNode = this.map.get(start.name);
        if (!startNode) {
            startNode = new LinkedStateType(start, undefined);
            this.map.set(start.name, startNode);
        }

        metaStart.setTransition(MetaAction.DoStart, startNode);

        this._current = [new ActiveState(metaStart, MetaState.Start)];
    }


    public static fromString<S extends string, A extends string>(
        name: string,
        start: S,
        ...items: StateMachineItem<S, S, A>[]
    ): StateMachine<S, A> {
        const getter = new StringTypeGetter<S, A>();
        return new StateMachine<S, A>(
            name,
            getter.get(start),
            items.map(item => ({
                state: getter.get(item.state),
                transitions: item.transitions.map(act => [act[0], new StringType(act[1])] as [A, StateType<S, A>])
            }))
        );
    }

    public static fromNamed<S extends NamedState, A extends string>(
        name: string,
        start: S,
        ...items: StateMachineItem<S, S, A>[]
    ): StateMachine<S, A> {
        const getter = new NamedTypeGetter<S, A>();
        return new StateMachine<S, A>(
            name,
            getter.get(start),
            items.map(item => ({
                state: getter.get(item.state),
                transitions: item.transitions.map(act => [act[0], new NamedType(act[1])] as [A, StateType<S, A>])
            }))
        );
    }

    public static fromType<S, A extends string, P = void>(
        name: string,
        start: LooseStateType<S, A, P>,
        ...items: StateMachineItem<LooseStateType<S, A, P>, LooseStateType<S, A, P>, A>[]
    ): StateMachine<S, A, P> {
        return new StateMachine<S, A, P>(name, start, [...items]);
    }


    private static createMap<S, A extends string, P>(
        items: Item<S, A, P>[],
        anytimeTransitions: [A, StateType<S, A, P>][],
    ): Map<string, LinkedStateType<S, A, P>> {
        const nameToType = new Map<string, StateType<S, A, P>>();
        for (const item of items) {
            nameToType.set(item.state.name, item.state);
            for (const transition of item.transitions) {
                nameToType.set(transition[1].name, transition[1]);
            }
        }

        for (const transition of anytimeTransitions) {
            nameToType.set(transition[1].name, transition[1]);
        }

        const nameToParent = new Map<string, StateType<S, A, P>>();
        items
        .filter(item => item.children)
        .forEach(item => {
            const type = nameToType.get(item.state.name);
            item.children.forEach(child => {
                nameToParent.set(child.state.name, type);
            })
        });

        const map = new Map<string, LinkedStateType<S, A, P>>();
        for (const name of nameToType.keys()) {
            this.setMap(map, name, nameToType, nameToParent);
        }

        for (const item of items) {
            const node = map.get(item.state.name);
            for (const tr of [...item.transitions, ...anytimeTransitions]) {
                node.setTransition(tr[0], map.get(tr[1].name));
            }
        }

        return map;
    }

    private static setMap<S, A extends string, P>(
        map: Map<string, LinkedStateType<S, A, P>>,
        name: string,
        nameToType: Map<string, StateType<S, A, P>>,
        nameToParent: Map<string, StateType<S, A, P>>,
    ): LinkedStateType<S, A, P> {
        let node = map.get(name);
        if (node) {
            return node;
        }

        let parent: LinkedStateType<S, A, P> = undefined;
        const parentType = nameToParent.get(name);
        if (parentType) {
            parent = map.get(parentType.name);
            if (!parent) {
                parent = this.setMap(map, parentType.name, nameToType, nameToParent); // Recursive
            }
        }

        node = new LinkedStateType(nameToType.get(name), parent);
        map.set(name, node);
        return node;
    }


    /**
     * Start action
     * @param params params for getState(*)
     */
    public start(params?: P): void {
        this.do(MetaAction.DoStart, params);
    }

    /**
     * Do the action
     * @param action action
     * @param params params for getState(*)
     * @returns success
     */
    public do(action: A, params?: P): boolean {
        const newType = this.getDestination(action);
        if (!newType) {
            this.addHistory(StateHistory.error([], this._current.map(s => s.name), action));
            this._stateChangeFailed.next(new StateChangeFailedEvent(
                this.currentStates, action, params,
                `[${this.name}] Invalid action. ${joinName(this._current)} -> ? : ${action}`
            ));
            return false;
        }

        this.setState(newType, action, params, false);
        return true;
    }

    /**
     * Try the action and set current state if transition failed
     * @param action action
     * @param state state on failed
     * @param params params for getState(*)
     * @returns success
     */
    public tryCatchForceSet(action: A, stateName: string, params?: P): boolean {
        const success = this.do(action, params);
        if (!success) {
            this.forceSet(stateName, action, params);
        }

        return success;
    }

    /**
     * Reset state
     */
    public reset(): void {
        const old = this._current;
        const metaStart = this.map.get(StartName);
        this._current = [new ActiveState(metaStart, MetaState.Start)];
        this.onStateChanged([], old, this._current, undefined, MetaStateAction.ResetName, undefined, true);
    }
    /**
     * Restart state
     * @param params params for getState(*)
     */
    public restart(params?: P): void {
        this.reset();
        this.start(params);
    }

    /**
     * Check availability of the action in current state.
     * @param action action
     */
    public can(action: A): boolean {
        return this.getDestination(action) !== undefined;
    }

    /**
     * Set current state forcibly
     * @param stateName state name
     * @param action action
     * @param params params
     * @throws RangeError
     */
    public forceSet(stateName: string, action: A, params?: P): void {
        const newType = this.map.get(stateName);
        if (!newType) {
            throw new RangeError(`[${this.name}] forceSet failed. Unknown state name. ${stateName}`);
        }

        this.setState(newType, action, params, true);
    }

    /**
     * Export state machine
     * @param writer writer
     */
    public export(writer: StatechartWriter): string {
        return writer(this.toChart());
    }

    /**
     * To statechart
     */
    public toChart(): Statechart {
        return {
            name: this.name,
            states: Array.from(this.map.entries()).map(state => ({
                name: state[0],
                transitions: Array.from(state[1].mapEntries()).map(transition => ({
                    action: transition[0],
                    destination: transition[1].name,
                } as StatechartTransition)),
                children: state[1].children.map(child => child.name),
            } as StatechartItem))
        };
    }

    private setState(newType: LinkedStateType<S, A, P>, action: A, params: P, forced: boolean): void {
        let newTypes = newType.inheritanceChain;

        const commonDepth = this.getCommonDepth(newTypes);
        const common = this._current.slice(0, commonDepth);
        const old = this._current.slice(commonDepth);
        newTypes = newTypes.slice(commonDepth);

        const newWrappers = newTypes.map(it => new ActiveState(it, it.type.getState(this, params)));

        this._current = [...common, ...newWrappers];
        this.onStateChanged(common, old, newWrappers, action, action, params, forced);
    }

    private getDestination(action: A): LinkedStateType<S, A, P> {
        let type: LinkedStateType<S, A, P>;
        for (let i = this._current.length; i-- > 0 && !type; ) {
            type = this._current[i].map.when(action);
        }

        return type;
    }

    private getCommonDepth(newTypes: LinkedStateType<S, A, P>[]): number {
        const maxDepth = Math.max(this._current.length, newTypes.length);

        let depth = 0;
        while (depth < maxDepth && this._current[depth].name === newTypes[depth].name) {
            depth++;
        }

        return depth;
    }

    /**
     * Add history
     * @param history history
     */
    private addHistory(history: StateHistory<A>): void {
        this._histories.push(history);
        if (this._histories.length > this._historyCapacity) {
            this._histories.shift();
        }
    }


    private onStateChanged(
        common: ActiveState<S, A, P>[],
        old: ActiveState<S, A, P>[],
        newWrappers: ActiveState<S, A, P>[],
        action: A,
        actionName: A,
        params: P,
        forced: boolean
    ): void {
        this.addHistory(StateHistory.ok([], old.map(s => s.name), newWrappers.map(s => s.name), action, forced));

        const transitionMsg = common.length > 0 ?
            `${joinName(common)} {${joinName(old)} -> ${joinName(newWrappers)}}` :
            `${joinName(old)} -> ${joinName(newWrappers)}`
        ;
        const event = new StateChangedEvent(
            common.map(wrapper => wrapper.instance),
            old.map(wrapper => wrapper.instance),
            newWrappers.map(wrapper => wrapper.instance),
            action, params,
            `[${this.name}] ${transitionMsg} : ${actionName}`
        );

        this._stateChanged.next(event);
        
        old.forEach(w => OnLeaveState.tryCall(w.map.type, event));
        newWrappers.forEach(w => OnEnterState.tryCall(w.map.type, event));
    }
}


// tslint:disable-next-line:max-classes-per-file
class ActiveState<S, A extends string, P> {
    public get name(): string {
        return this.map.type.name;
    } 

    constructor(
        public readonly map: LinkedStateType<S, A, P>,
        public readonly instance: S
    ) {
    }
}

// tslint:disable-next-line:max-classes-per-file
class StringType<S extends string, A extends string> implements StateType<S, A> {
    public get name(): string {
        return this.state;
    }

    constructor(
        private readonly state: S
    ) {
    }

    public getState(): S {
        return this.state;
    }
}

// tslint:disable-next-line:max-classes-per-file
class NamedType<S extends NamedState, A extends string, P> implements StateType<S, A, P>, OnEnterState.Any, OnLeaveState.Any {
    public get name(): string {
        return this.state.name;
    }

    public readonly onEnterState: (event: StateChangedEvent<S, A, P>) => void;
    public readonly onLeaveState: (event: StateChangedEvent<S, A, P>) => void;

    constructor(
        private readonly state: S,
    ) {
        this.onEnterState = OnEnterState.get(state);
        this.onLeaveState = OnLeaveState.get(state);
    }

    public getState(): S {
        return this.state;
    }
}

// tslint:disable-next-line:max-classes-per-file
class StringTypeGetter<S extends string, A extends string> {
    private map: Map<string, StateType<S, A>> = new Map();

    public get(state: S): StateType<S, A> {
        if (state === MetaState.Anytime) {
            return MetaState.Anytime;
        }

        let type = this.map.get(state);
        if (!type) {
            type = new StringType(state);
            this.map.set(state, type);
        }

        return type;
    }
}

// tslint:disable-next-line:max-classes-per-file
class NamedTypeGetter<S extends NamedState, A extends string> {
    private map: Map<string, StateType<S, A>> = new Map();

    public get(state: S): StateType<S, A> {
        if (state === MetaState.Anytime) {
            return MetaState.Anytime;
        }

        let type = this.map.get(state.name);
        if (!type) {
            type = new NamedType(state);
            this.map.set(state.name, type);
        }

        return type;
    }
}



function joinName(named: ActiveState<{}, string, {}>[]): string {
    return named.map(s => s.name).join('/');
}
