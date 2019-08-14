import {
    StateType, StateMachineItem, NamedState, StatechartWriter,
    Statechart, StatechartItem, StatechartTransition, OnLeaveState, OnEnterState
} from '../interface';
import { StateChangedEvent, StateChangeFailedEvent } from '../event-args';
import { MetaState, MetaStateAction as MetaAction, MetaStateAction } from '../state-meta';
import { Subject, Observable } from 'rxjs';
import { StateHistory } from '../state-history';
import { StartType, StartName } from '../state-meta/meta-state';
import { LinkedStateType } from './linked-state-type';
import { MapBuilder } from './map-builder';
import { NolItem } from '../private-interface';
import { NamedTypeGetter, StringTypeGetter } from './type-getter';
import { ActiveState } from './active-state';


export class StateMachine<S, A extends string, P = {}> {

    //
    // Public var

    /** Current leaf state */
    public get current(): S | undefined {
        return this.curLeaf.instance;
    }
    /** Current root state */
    public get currentRoot(): S | undefined {
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
        items: NolItem<S, A, P>[]
    ) {
        const anytimeI: number = items.findIndex(item => `${item.state}` === MetaState.AnytimeName);
        let anytimeTransitions: [A, StateType<S, A, P>][] = [];
        if (anytimeI >= 0) {
            anytimeTransitions = items.splice(anytimeI, 1)[0].transitions;
        }

        this.map = MapBuilder.build(items, anytimeTransitions);

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
        ...items: StateMachineItem<S, A>[]
    ): StateMachine<S, A> {
        const getter = new StringTypeGetter<S, A>();
        return new StateMachine<S, A>(name, getter.get(start), getter.convert(items));
    }

    public static fromNamed<S extends NamedState, A extends string>(
        name: string,
        start: S,
        ...items: StateMachineItem<S, A>[]
    ): StateMachine<S, A> {
        const getter = new NamedTypeGetter<S, A>();
        return new StateMachine<S, A>(name, getter.get(start), getter.convert(items));
    }

    public static fromType<S, A extends string, P = {}>(
        name: string,
        start: StateType<S, A, P>,
        ...items: StateMachineItem<StateType<S, A, P>, A>[]
    ): StateMachine<S, A, P> {
        return new StateMachine<S, A, P>(name, start, [...items]);
    }

    private static toChartItem<S, A extends string, P>(
        type: LinkedStateType<S, A, P>
    ): StatechartItem {
        return {
            name: type.name,
            transitions: Array.from(type.mapEntries()).map(transition => ({
                action: transition[0],
                destination: transition[1].name,
            } as StatechartTransition)),
            children: type.children.map(child => this.toChartItem(child)),
        };
    }

    /**
     * Check current state
     * @param state state
     */
    public currentIs(state: S): boolean;
    /**
     * Check current state
     * @param name name
     */
    public currentIs(name: string): boolean;
    public currentIs(stateOrName: S | string): boolean {
        return typeof stateOrName === 'string'
            ? this._current.some(cur => cur.name === stateOrName)
            : this._current.some(cur => cur.instance === stateOrName)
        ;
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
                `[${this.name}] Invalid action. ${this.curLeaf.name} -> ? : ${action}`
            ));
            return false;
        }

        this.setState(newType, action, params, false);
        return true;
    }

    /**
     * Change current state forcibly if transition failed
     * @param action action
     * @param forcedStateName forced state name on failed
     * @param params params for getState(*)
     * @returns success
     * @throws RangeError
     */
    public forceIfFail(action: A, forcedStateName: string, params?: P): boolean;
    /**
     * Change current state forcibly if transition failed
     * @param action action
     * @param forcedStateNameOwner forced state name owner on failed
     * @param params params for getState(*)
     * @returns success
     * @throws RangeError
     */
    public forceIfFail(action: A, forcedStateNameOwner: NamedState, params?: P): boolean;
    /**
     * Change current state forcibly if transition failed
     * @param action action
     * @param forcedStateNameOwner forced state name owner on failed
     * @param params params for getState(*)
     * @returns success
     * @throws RangeError
     */
    public forceIfFail(action: A, forcedStateNameOwner: StateType<S, A, P>, params?: P): boolean;
    public forceIfFail(action: A, forcedStateNameLike: string | NamedState | StateType<S, A, P>, params?: P): boolean {
        const success = this.do(action, params);
        if (!success) {
            const name = typeof forcedStateNameLike === "string" ? forcedStateNameLike : forcedStateNameLike.name;
            this.forceSet(name, action, params);
        }

        return success;
    }

    /**
     * Require state to equal expected after the action.
     * If the action makes state expected one, do nothing
     * Else, set state forcibly
     * @param action action
     * @param expectedStateName expected state name
     */
    public require(action: A, expectedStateName: string, params?: P): boolean 
    /**
     * Require state to equal expected after the action.
     * If the action makes state expected one, do nothing
     * Else, set state forcibly
     * @param action action
     * @param expectedStateNameOwner expected state name owner
     */
    public require(action: A, expectedStateNameOwner: string | NamedState | StateType<S, A, P>, params?: P): boolean 
    /**
     * Require state to equal expected after the action.
     * If the action makes state expected one, do nothing
     * Else, set state forcibly
     * @param action action
     * @param expectedStateNameOwner expected state name owner
     */
    public require(action: A, expectedStateNameOwner: StateType<S, A, P>, params?: P): boolean;
    public require(action: A, expectedStateNameLike: string | NamedState | StateType<S, A, P>, params?: P): boolean {
        const name = typeof expectedStateNameLike === 'string' ? expectedStateNameLike : expectedStateNameLike.name;
        const type = this.getDestination(action);
        if (type !== undefined && type.name === name) {
            this.setState(type, action, params, false);
            return true;
        }

        this.forceSet(name, action, params);
        return false;
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
     * @param nominalAction nominal action
     * @param params params
     * @throws RangeError
     */
    public forceSet(stateName: string, nominalAction: A, params?: P): void {
        const newType = this.map.get(stateName);
        if (!newType) {
            throw new RangeError(`[${this.name}] forceSet failed. Unknown state name. ${stateName}`);
        }

        this.setState(newType, nominalAction, params, true);
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
            states: Array.from(this.map.values())
                .filter(type => type.parent === undefined)
                .map(type => StateMachine.toChartItem(type))
        };
    }

    private setState(newType: LinkedStateType<S, A, P>, action: A, params: P, forced: boolean): void {
        let newTypes = newType.findLeaf().inheritanceChain;

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
            type = this._current[i].linked.when(action);
        }

        return type;
    }

    private getCommonDepth(newTypes: LinkedStateType<S, A, P>[]): number {
        const maxDepth = Math.min(this._current.length, newTypes.length);

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
        newStates: ActiveState<S, A, P>[],
        action: A,
        actionName: A,
        params: P,
        forced: boolean
    ): void {
        this.addHistory(StateHistory.ok([], old.map(s => s.name), newStates.map(s => s.name), action, forced));

        const transitionMsg = toTransition(common, old, newStates);
        const forcedMsg = forced ? '(forced)' : '';
        const event = new StateChangedEvent(
            common.map(state => state.instance),
            old.map(state => state.instance),
            newStates.map(state => state.instance),
            action, params,
            forced,
            `[${this.name}] ${transitionMsg} : ${actionName}${forcedMsg}`
        );

        this._stateChanged.next(event);
        
        old.forEach(w => OnLeaveState.tryCall(w.linked.type, event));
        newStates.forEach(w => OnEnterState.tryCall(w.linked.type, event));
    }
}


function toTransition(
    common: ActiveState<{}, string, {}>[],
    old: ActiveState<{}, string, {}>[],
    newStates: ActiveState<{}, string, {}>[],
): string {
    return `${[...common, ...old].pop().name} -> ${[...common, ...newStates].pop().name}`;
}
