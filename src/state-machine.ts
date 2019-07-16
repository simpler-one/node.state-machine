import {
    StateType, StateMachineItem, NamedState, StatechartWriter,
    Statechart, StatechartItem, StatechartTransition
} from './interface';
import { StateChangedEvent, StateChangeFailedEvent } from './event-args';
import { MetaState, MetaStateAction as MetaAction, MetaStateAction } from './state-meta';
import { Subject, Observable } from 'rxjs';
import { StateHistory } from './state-history';
import { StartType, StartName } from './state-meta/meta-state';
import { StateMapItem } from './state-map-item';


type Item<S, Ac extends string, P, At> = StateMachineItem<string, StateType<S, Ac, P, At>, Ac>;
type LooseStateType<S, Ac extends string, P> = StateType<S, Ac | undefined, P | void, At>;

export class StateMachine<S, Ac extends string, P = void, At = void> {

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
    public get histories(): StateHistory<Ac>[] {
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

    public get stateChanged(): Observable<StateChangedEvent<S, Ac, P>> {
        return this._stateChanged.asObservable();
    }
    public get stateChangeFailed(): Observable<StateChangeFailedEvent<S, Ac, P>> {
        return this._stateChangeFailed.asObservable();
    }


    private readonly map: Map<string, StateMapItem<S, A, P>>;
    // private readonly parentMap: Map<string, StateType<S, A, P>> = new Map();

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

        const metaStart = new StateMapItem<S, A, P>(StartType, undefined);
        this.map.set(MetaState.StartName, metaStart);
        let startNode = this.map.get(start.name);
        if (!startNode) {
            startNode = new StateMapItem(start, undefined);
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
        const i = items.map(item => ({
            state: item.state,
            transitions: item.transitions.map(act => [act[0], new StringType(act[1])] as [A, StateType<S, A>])
        }));
        return new StateMachine<S, A>(
            name,
            new StringType(start),
            items.map(item => ({
                state: item.state,
                transitions: item.transitions.map(act => [act[0], new StringType(act[1])] as [A, StateType<S, A>])
            }))
        );
    }

    public static fromNamed<S extends NamedState<S, A, P>, A extends string, P = void>(
        name: string,
        start: S,
        ...items: StateMachineItem<S, S, A>[]
    ): StateMachine<S, A, P> {
        return new StateMachine<S, A, P>(
            name,
            new NamedType(start),
            items.map(item => ({
                state: item.state.name,
                transitions: item.transitions.map(act => [act[0], new NamedType(act[1])] as [A, StateType<S, A, P>])
            }))
        );
    }

    public static fromType<S, A extends string, P = void>(
        name: string,
        start: LooseStateType<S, A, P>,
        ...items: StateMachineItem<LooseStateType<S, A, P>, LooseStateType<S, A, P>, A>[]
    ): StateMachine<S, A, P> {
        return new StateMachine<S, A, P>(
            name,
            start,
            items.map((item) => ({
                state: item.state.name,
                transitions: item.transitions
            } as Item<S, A, P>))
        );
    }


    private static createMap<S, A extends string, P>(
        items: Item<S, A, P>[],
        anytimeActions: [A, StateType<S, A, P>][],
    ): Map<string, StateMapItem<S, A, P>> {
        const nameToType = new Map<string, StateType<S, A, P>>();
        for (const item of items) {
            for (const action of item.transitions) {
                nameToType.set(item.state, action[1]);
            }
        }

        const nameToParent = new Map<string, StateType<S, A, P>>();
        items
        .filter(item => item.children)
        .forEach(item => {
            const type = nameToType.get(item.state);
            item.children.forEach(child => {
                nameToParent.set(child.state, type);
            })
        });

        const map = new Map<string, StateMapItem<S, A, P>>();
        for (const item of items) {
            this.setMap(map, item.state, nameToType, nameToParent);
        }

        for (const item of items) {
            const node = map.get(item.state);
            for (const act of [...item.transitions, ...anytimeActions]) {
                node.setTransition(act[0], map.get(act[1].name));
            }
        }

        return map;
    }

    private static setMap<S, A extends string, P>(
        map: Map<string, StateMapItem<S, A, P>>,
        name: string,
        nameToType: Map<string, StateType<S, A, P>>,
        nameToParent: Map<string, StateType<S, A, P>>,
    ): StateMapItem<S, A, P> {
        let node = map.get(name);
        if (node) {
            return node;
        }

        const parentType = nameToParent.get(name);
        let parent = map.get(parentType.name);
        if (!parent && parentType) {
            this.setMap(map, parentType.name, nameToType, nameToParent)
            parent = map.get(parentType.name); // Recursive
        }

        node = new StateMapItem(nameToType.get(name), parent);
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
     */
    public do(action: A, params?: P): void {
        let newItems = this.getTypes(action);
        if (newItems.length === 0) {
            this.addHistory(new StateHistory(new Date(), [], this._current.map(s => s.name), undefined, action));
            this._stateChangeFailed.next(new StateChangeFailedEvent(
                this.currentStates, action, params,
                `[${this.name}] Invalid action. ${joinName(this._current)} -> ? : ${action}`
            ));
            return;
        }

        const commonDepth = this.getCommonDepth(newItems);
        const common = this._current.slice(0, commonDepth);
        const old = this._current.slice(commonDepth);
        newItems = newItems.slice(commonDepth);

        const newWrappers = newItems.map(it => new ActiveState(it, it.type.getState(this, params)));

        this._current = [...common, ...newWrappers];
        this.onStateChanged(common, old, newWrappers, action, action, params);
    }

    /**
     * Reset state
     */
    public reset(): void {
        const old = this._current;
        const metaStart = this.map.get(StartName);
        this._current = [new ActiveState(metaStart, MetaState.Start)];
        this.onStateChanged([], old, this._current, undefined, MetaStateAction.ResetName, undefined);
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
                actions: Array.from(state[1].mapEntries()).map(action => ({
                    action: action[0],
                    destination: action[1].name
                } as StatechartTransition))
            } as StatechartItem))
        };
    }

    /**
     * Get state types by action
     * @param action action
     */
    protected getTypes(action: A): StateMapItem<S, A, P>[] {
        const destination = this.getDestination(action);

        const newItems: StateMapItem<S, A, P>[] = [];
        let item = destination;
        while (item) {
            newItems.push(item);
            item = item.parent;
        }

        return newItems.reverse();
    }

    private getDestination(action: A): StateMapItem<S, A, P> {
        let item: StateMapItem<S, A, P>;
        for (let i = this._current.length; i-- > 0 && !item; ) {
            item = this._current[i].map.when(action);
        }

        return item;
    }

    private getCommonDepth(newItems: StateMapItem<S, A, P>[]): number {
        const maxDepth = Math.max(this._current.length, newItems.length);

        let depth = 0;
        while (depth < maxDepth && this._current[depth].name === newItems[depth].name) {
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
    ): void {
        this.addHistory(new StateHistory(
            new Date(), common.map(w => w.name), old.map(w => w.name), newWrappers.map(t => t.name), actionName)
        );

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
        
        old.filter(w => w.map.type.onLeaveState)
            .forEach(w => w.map.type.onLeaveState(event));
        newWrappers.filter(w => w.map.type.onEnterState)
            .forEach(w => w.map.type.onEnterState(event));
    }
}


// tslint:disable-next-line:max-classes-per-file
class ActiveState<S, A extends string, P> {
    public get name(): string {
        return this.map.type.name;
    } 

    constructor(
        public readonly map: StateMapItem<S, A, P>,
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
class NamedType<S extends NamedState<S, A, P>, A extends string, P> implements StateType<S, A, P> {
    public get name(): string {
        return this.state.name;
    }

    public readonly onEnterState: (event: StateChangedEvent<S, A, P>) => void;
    public readonly onLeaveState: (event: StateChangedEvent<S, A, P>) => void;

    constructor(
        private readonly state: S,
    ) {
        this.onEnterState = state.onEnterState;
        this.onLeaveState = state.onLeaveState;
    }

    public getState(): S {
        return this.state;
    }
}



function joinName(named: ActiveState<{}, string, {}>[]): string {
    return named.map(s => s.name).join('/');
}
