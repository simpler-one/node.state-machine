// tslint:disable:no-namespace
import { StateMachine } from "./state-machine";
import { StateChangedEvent } from "./event-args";


export interface NamedState {
    readonly name: string;
}

export interface StateType<S, A extends string, P = void> {
    readonly name: string;
    getState(stateMachine: StateMachine<S, A, P>, params: P): S;
}

export interface OnEnterState<S, A, P = void> {
    onEnterState(event: StateChangedEvent<S, A, P>): void;
}

export interface OnLeaveState<S, A, P = void> {
    onLeaveState(event: StateChangedEvent<S, A, P>): void;
}

export interface Attributed {
    has(attribute: {}): boolean;
}

export interface StateMachineItem<S, T, A> {
    state: S;
    transitions: [A, T][];
    startChild?: T;
    children?: StateMachineItem<S, T, A>[];
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
