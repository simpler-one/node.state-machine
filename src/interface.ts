// tslint:disable:no-namespace
import { StateMachine } from "./state-machine";
import { StateChangedEvent } from "./event-args";


export interface NamedState {
    readonly name: string;
}

export interface StateType<S, A extends string, P = void> {
    readonly name: string;
    getState(stateMachine: StateMachine<S, A, P>, params?: P): S;
}

export interface OnEnterState<S = {}, A = {}, P = void> {
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

export interface OnLeaveState<S = {}, A = {}, P = void> {
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


export interface Statechart {
    name: string;
    states: StatechartItem[];
}

export interface StatechartItem {
    name: string;
    transitions: StatechartTransition[];
    children: string[];
}

export interface StatechartTransition {
    action: string;
    destination: string;
}

export type StatechartWriter = (map: Statechart) => string;
