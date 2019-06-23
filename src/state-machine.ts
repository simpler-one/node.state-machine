import { StateType, StateMachineItem, Named, StateMachineWriter, StateMachineMap, StateMachineMapItem, StateMachineMapAction } from './interface';
import { MetaState, MetaStateAction } from './state-meta';


type StateMap<S, A, P> = Map<string, Map<string, StateType<S, A, P>>>;
type Item<S, A, P> = StateMachineItem<string, StateType<S, A, P>, A>;
type LooseStateType<S, A, P> = StateType<S, A | void, P | void>

export class StateMachine<S, A extends string, P = void> {

    //
    // Public var

    /** Current status */
    public get current(): S {
        return this._current.state;
    }

    //
    // Public event

    public set stateChanged(handler: (oldState: S, newState: S, action: A, message: string) => void) {
        this._stateChanged = handler ? handler : () => undefined;
    }
    public set stateCstateChangeFailedhanged(handler: (curState: S, action: A, message: string) => void) {
        this._stateChangeFailed = handler ? handler : () => undefined;
    }


    private readonly map: StateMap<S, A, P>;
    private _current: StateWrapper<S, A, P>;

    private _stateChanged: (oldState: S, newState: S, action: A, message: string) => void = () => undefined;
    private _stateChangeFailed: (curState: S, action: A, message: string) => void = () => undefined;


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

    public static fromNamed<S extends Named, A extends string>(
        name: string,
        start: S,
        ...items: StateMachineItem<S, S, A>[]
    ): StateMachine<S, A> {
        return new StateMachine<S, A>(
            name,
            new NamedType(start),
            items.map(item => ({
                state: item.state.name,
                actions: item.actions.map(action => [action[0], new NamedType(action[1])] as [A, StateType<S, A>])
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
     * Do the action
     * @param action action
     * @param params params for getState(*)
     */
    public do(action: A, params?: P): void {
        const type: StateType<S, A, P> = this.getType(action);
        if (type === undefined) {
            this._stateChangeFailed(this._current.state, action, `[${this.name}] Invalid action. ${this._current.name} -> ? : ${action}`);
            return;
        }

        const old: StateWrapper<S, A, P> = this._current;
        const next: S = type.getState(params);
        this._current = new StateWrapper(type, next);
        this._stateChanged(old.state, next, action, `[${this.name}] ${this._current.name} -> ${type.name} : ${action}`);
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
}


class StateWrapper<S, A, P> {
    public get name(): string {
        return this.type.name;
    } 

    constructor(
        public readonly type: StateType<S, A, P>,
        public readonly state: S
    ) {
    }
}

class StringType<S extends string, A> implements StateType<S, A> {
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

class NamedType<S extends Named, A> implements StateType<S, A> {
    public get name(): string {
        return this.state.name;
    }

    constructor(
        private readonly state: S
    ) {
    }

    public getState(): S {
        return this.state;
    }
}
