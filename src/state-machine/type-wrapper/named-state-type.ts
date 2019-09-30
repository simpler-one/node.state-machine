import { NamedState, OnEnterState, OnLeaveState, StateType } from "../../interface";
import { StateChangedEvent } from "../../event-args";


export class NamedType<S extends NamedState, A extends string, P>
    implements StateType<S, A, P>, OnEnterState.Any, OnLeaveState.Any
{
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
