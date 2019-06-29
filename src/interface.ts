export interface NamedState<S, A = void, P = void> {
    readonly name: string;
    onEnterState?(oldState: S, newState: S, action: A, params: P): void;
    onLeaveState?(oldState: S, newState: S, action: A, params: P): void;
}

export interface StateType<S, A = void, P = void> {
    readonly name: string;
    getState(params: P): S;
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
