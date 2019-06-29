import { StateMachine } from "./state-machine";

export interface NamedState<S, A extends string, P = void> {
    readonly name: string;
    onEnterState?(oldState: S, newState: S, action: A, params: P): void;
    onLeaveState?(oldState: S, newState: S, action: A, params: P): void;
}

export interface StateType<S, A extends string, P = void> {
    readonly name: string;
    getState(stateMachine: StateMachine<S, A, P>, params: P): S;
    onEnterState?(oldState: S, newState: S, action: A, params: P): void;
    onLeaveState?(oldState: S, newState: S, action: A, params: P): void;
}

export interface StateMachineItem<S, T, A> {
    state: S;
    actions: [A, T][];
}

export interface StateMachineMap {
    name: string;
    states: StateMachineMapItem[];
}

export interface StateMachineMapItem {
    name: string;
    actions: StateMachineMapAction[];
}

export interface StateMachineMapAction {
    name: string;
    destination: string;
}

export type StateMachineWriter = (map: StateMachineMap) => string;
