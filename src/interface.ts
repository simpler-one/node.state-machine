// tslint:disable:no-namespace
import { StateMachine } from "./state-machine";

export interface NamedState<S, A extends string, P = void> {
    readonly name: string;
    onEnterState?(oldState: S | undefined, newState: S, action: A, params: P): void;
    onLeaveState?(oldState: S, newState: S | undefined, action: A, params: P): void;
}

export interface StateType<S, A extends string, P = void> {
    readonly name: string;
    getState(stateMachine: StateMachine<S, A, P>, params: P): S;
    onEnterState?(oldState: S | undefined, newState: S, action: A, params: P): void;
    onLeaveState?(oldState: S, newState: S | undefined, action: A, params: P): void;
}

export interface StateMachineItem<S, T, A> {
    state: S;
    actions: [A, T][];
}

export type StateChangedArgs<S, A> = { oldState: S | undefined, newState: S | undefined, action: A, message: string };
export type StateChangeFailedArgs<S, A> = { curState: S | undefined, action: A, message: string };


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

export type StatechartWriter = (map: StateMachineMap) => string;
