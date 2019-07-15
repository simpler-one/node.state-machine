// tslint:disable:no-namespace
import { StateMachine } from "./state-machine";
import { StateChangedEvent } from "./event-args";

export interface NamedState<S, A extends string, P = void> {
    readonly name: string;
    onEnterState?(event: StateChangedEvent<S, A, P>): void;
    onLeaveState?(event: StateChangedEvent<S, A, P>): void;
}

export interface StateType<S, A extends string, P = void> {
    readonly name: string;
    getState(stateMachine: StateMachine<S, A, P>, params: P): S;
    onEnterState?(event: StateChangedEvent<S, A, P>): void;
    onLeaveState?(event: StateChangedEvent<S, A, P>): void;
}

export interface StateMachineItem<N, T, A> {
    state: N;
    transitions: [A, T][];
    startChild?: T;
    children?: StateMachineItem<N, T, A>[];
}


export interface Statechart {
    name: string;
    states: StatechartItem[];
}

export interface StatechartItem {
    name: string;
    actions: StatechartTransition[];
}

export interface StatechartTransition {
    action: string;
    destination: string;
}

export type StatechartWriter = (map: Statechart) => string;
