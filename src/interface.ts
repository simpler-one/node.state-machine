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

export type StateChangedEventArgs<S, A> = { oldState: S | undefined, newState: S | undefined, action: A, message: string };
export type StateChangeFailedEventArgs<S, A> = { curState: S | undefined, action: A, message: string };


/**
 * @param indices 0-based index array
 * @param count 1-based count
 */
export type AutoIndex = (indices: number[], count: number) => string;

export interface PumlWriterOptions {
    autoIndex?: AutoIndex;
    arrowDirections?: {
        from?: string;
        to?: string;
        direction: PumlWriterOptions.ArrowDirection | 'up' | 'down' | 'left' | 'right';
    }[]
}
// tslint:disable-next-line:no-namespace
export namespace PumlWriterOptions {
    export const AutoNumber: AutoIndex = (indices, count) => `(${count})`;
    export const AutoNumberDot: AutoIndex = (indices, count) => `${count}.`;
    export const AutoNumberColon: AutoIndex = (indices, count) => `${count}:`;
    export const AutoIndex: AutoIndex = (indices, count) => `(${indices.map(index => index + 1).join('.')})`;

    export enum ArrowDirection {
        Up = 'up',
        Down = 'down',
        Left = 'left',
        Right = 'right',
    }

    export function fill(options: PumlWriterOptions): PumlWriterOptions {
        return {
            autoIndex: undefined,
            arrowDirections: [ { direction: ArrowDirection.Down } ],
            ...options
        };
    }
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
