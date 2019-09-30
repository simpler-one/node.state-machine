// tslint:disable:no-namespace
import { StateChangedEvent } from "./event-args";
import { StateMachine } from "./state-machine";


export interface NamedState {
    readonly name: string;
}

export interface StateType<S, A extends string, P = {}> {
    readonly name: string;
    getState(stateMachine: StateMachine<S, A, P>, params?: P): S;
}

export interface OnEnterState<S = {}, A = {}, P = {}> {
    onEnterState(event: StateChangedEvent<S, A, P>): void;
}
export namespace OnEnterState {
    export type Any = OnEnterState<{}, {}, {}>;

    export function tryCall<S, A, P>(obj: {}, event: StateChangedEvent<S, A, P>): void {
        if ((<Any>obj).onEnterState) {
            (<Any>obj).onEnterState(event);
        }
    }

    export function get<S, A, P>(obj: {}): ((event: StateChangedEvent<S, A, P>) => void) | undefined {
        return (<Any>obj).onEnterState ? (event) => (<Any>obj).onEnterState(event) : undefined;
    }
}

export interface OnLeaveState<S = {}, A = {}, P = {}> {
    onLeaveState(event: StateChangedEvent<S, A, P>): void;
}
export namespace OnLeaveState {
    export type Any = OnLeaveState<{}, {}, {}>;

    export function tryCall<S, A, P>(obj: {}, event: StateChangedEvent<S, A, P>): void {
        if ((<Any>obj).onLeaveState) {
            (<Any>obj).onLeaveState(event);
        }
    }

    export function get<S, A, P>(obj: {}): ((event: StateChangedEvent<S, A, P>) => void) | undefined {
        return (<Any>obj).onLeaveState ? (event) => (<Any>obj).onLeaveState(event) : undefined;
    }
}


export interface StateMachineItem<S, A> {
    state: S;
    transitions: [A, S][];
    startChild?: S;
    children?: StateMachineItem<S, A>[];
}
