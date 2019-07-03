import {
    StateType, StateMachineItem, NamedState, StateMachineWriter,
    StateMachineMap, StateMachineMapItem, StateMachineMapAction
} from './interface';
import { MetaState, MetaStateAction } from './state-meta';
import { Subject, Observable } from 'rxjs';
import { StateHistory } from './state-history';


type StateMap<S, A extends string, P> = Map<string, Map<string, StateType<S, A, P>>>;
type Item<S, A extends string, P> = StateMachineItem<string, StateType<S, A, P>, A>;
type LooseStateType<S, A extends string, P> = StateType<S, A | undefined, P | void>;

type StateChangedEventArgs<S, A> = { oldState: S, newState: S, action: A, message: string };
type StateChangeFailedEventArgs<S, A> = { curState: S, action: A, message: string };

export class StateMachine<S, A extends string, P = void> {

    //
    // Public var

    /** Current status */
    public get current(): S {
        return this._current.state;
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
        if (capacity < 0) {
            this._historyCapacity = 0;
        } else {
            this._historyCapacity = capacity;
        }

        const over = this._histories.length - this._historyCapacity;
        if (over > 0) {
            this._histories.splice(0, over);
        }
    }

    //
    // Public event

    public get stateChanged(): Observable<StateChangedEventArgs<S, A>> {
        return this._stateChanged.asObservable();
    }
    public get stateCstateChangeFailed(): Observable<StateChangeFailedEventArgs<S, A>> {
        return this._stateChangeFailed.asObservable();
    }


    private readonly map: StateMap<S, A, P>;
    private _current: StateWrapper<S, A, P>;
    private _histories: StateHistory<A>[] = [];
    private _historyCapacity: number = 100;

    private readonly _stateChanged: Subject<StateChangedEventArgs<S, A>> = new Subject();
    private readonly _stateChangeFailed: Subject<StateChangeFailedEventArgs<S, A>> = new Subject();


    //
    // Public static method

    public static fromString<S extends string, A extends string>(
        name: string,
        start: S,
        ...items: StateMachineItem<S, S, A>[]
    ): StateMachine<S, A> {
        const i = items.map(item => ({
            state: item.state,
            actions: item.actions.map(action => [action[0], new StringType(action[1])] as [A, StateType<S, A>])
        }));
        return new StateMachine<S, A>(
            name,
            new StringType(start),
            items.map(item => ({
                state: item.state,
                actions: item.actions.map(action => [action[0], new StringType(action[1])] as [A, StateType<S, A>])
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
                actions: item.actions.map(action => [action[0], new NamedType(action[1])] as [A, StateType<S, A, P>])
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
                actions: item.actions
            } as Item<S, A, P>))
        );
    }


    protected constructor(
        public readonly name: string,
        start: StateType<S, A, P>,
        items: Item<S, A, P>[]
    ) {
        const anytimeI: number = items.findIndex(item => `${item.state}` === MetaState.AnytimeName);
        let anytimeActions: [A, StateType<S, A, P>][] = [];
        if (anytimeI >= 0) {
            anytimeActions = items.splice(anytimeI, 1)[0].actions;
        }

        this.map = new Map(items.map(item => [
            item.state,
            new Map(item.actions.concat(anytimeActions))
        ] as [string, Map<string, StateType<S, A, P>>]));

        this.map.set(MetaState.StartName, new Map([[MetaStateAction.DoStart, start]]));

        this._current = new StateWrapper(new StringType(MetaState.StartName as undefined), MetaState.Start);
    }


    /**
     * Start action
     * @param params params for getState(*)
     */
    public start(params?: P): void {
        this.do(MetaStateAction.DoStart, params);
    }

    /**
     * Do the action
     * @param action action
     * @param params params for getState(*)
     */
    public do(action: A, params?: P): void {
        const type: StateType<S, A, P> = this.getType(action);
        if (type === undefined) {
            this.addHistory(new StateHistory(new Date(), this._current.name, undefined, action));
            this._stateChangeFailed.next({
                curState: this._current.state,
                action,
                message: `[${this.name}] Invalid action. ${this._current.name} -> ? : ${action}`
            });
            return;
        }

        const old: StateWrapper<S, A, P> = this._current;
        const next: S = type.getState(this, params);
        this._current = new StateWrapper(type, next);
        this.addHistory(new StateHistory(new Date(), old.name, type.name, action));
        this._stateChanged.next({
            oldState: old.state,
            newState: next,
            action,
            message: `[${this.name}] ${this._current.name} -> ${type.name} : ${action}`
        });
        if (old.type.onLeaveState) old.type.onLeaveState(old.state, next, action, params);
        if (type.onEnterState) type.onEnterState(old.state, next, action, params);
    }

    /**
     * Check availability of the action in current state.
     * @param action action
     */
    public can(action: A): boolean {
        return this.getType(action) !== undefined;
    }

    /**
     * Export state machine
     * @param writer writer
     */
    public export(writer: StateMachineWriter): string {
        return writer(this.toMachineMap());
    }

    /**
     * To machine map
     */
    public toMachineMap(): StateMachineMap {
        return {
            name: this.name,
            states: Array.from(this.map.entries()).map(state => ({
                name: state[0],
                actions: Array.from(state[1].entries()).map(action => ({
                    name: action[0],
                    destination: action[1].name
                } as StateMachineMapAction))
            } as StateMachineMapItem))
        };
    }

    /**
     * Get state type by action
     * @param action action
     */
    protected getType(action: A): StateType<S, A, P> {
        return this.map.get(this._current.name).get(action);
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
}

// tslint:disable-next-line:max-classes-per-file
class StateWrapper<S, A extends string, P> {
    public get name(): string {
        return this.type.name;
    } 

    constructor(
        public readonly type: StateType<S, A, P>,
        public readonly state: S
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

    public readonly onEnterState: (oldState: S, newState: S, action: A, params: P) => void;
    public readonly onLeaveState: (oldState: S, newState: S, action: A, params: P) => void;

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
