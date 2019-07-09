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


/**
 * @param indices 0-based index array
 * @param count 1-based count
 */
export type AutoIndex = (indices: number[], count: number) => string;
export namespace AutoIndex {
    const SmallA: number = 'a'.charCodeAt(0);
    const LargeA: number = 'A'.charCodeAt(0);
    const AlphaSpan: number = 'Z'.charCodeAt(0) - LargeA + 1;

    export const Number: AutoIndex = (indices, count) => `(${count})`;
    export const NumberDot: AutoIndex = (indices, count) => `${count}.`;
    export const NumberColon: AutoIndex = (indices, count) => `${count}:`;
    export const Alpha: AutoIndex = (indices, count) => alphaOf(count - 1, LargeA);
    export const NumIndex: AutoIndex = (indices) => `(${indices.map(index => index + 1).join('.')})`;
    export const AlphaNumIndex: AutoIndex = (indices) => `(${alphaOf(indices[0], SmallA)}${indices[1] + 1})`;
    export const LargeAlphaNumIndex: AutoIndex = (indices) => `(${alphaOf(indices[0], LargeA)}${indices[1] + 1})`;

    function alphaOf(value: number, charCodeOffset: number): string {
        let result = '';
        let val = value;

        do {
            result = String.fromCharCode(charCodeOffset + val % AlphaSpan) + result;
            val = Math.floor(val / AlphaSpan);
        } while (val > 0)

        return result;
    }
}

export interface PumlWriterOptions {
    autoIndex?: AutoIndex;
    arrows?: {
        from?: string;
        to?: string;
        direction: PumlWriterOptions.ArrowDirectionType;
        bothWays?: boolean;
        /* color?: string; reserved for future */
    }[];
}
export namespace PumlWriterOptions {
    export const Model: PumlWriterOptions = {};

    export type ArrowDirectionType = 'up' | 'down' | 'left' | 'right' | ArrowDirection;
    export enum ArrowDirection {
        Up = 'up',
        Down = 'down',
        Left = 'left',
        Right = 'right',
    }
    export namespace ArrowDirection {
        const ReverseMap = new Map<ArrowDirectionType, ArrowDirectionType>([
            [ArrowDirection.Up, ArrowDirection.Down],
            [ArrowDirection.Down, ArrowDirection.Up],
            [ArrowDirection.Left, ArrowDirection.Right],
            [ArrowDirection.Right, ArrowDirection.Left],
        ]);

        export function reverse(direction: ArrowDirectionType): ArrowDirectionType {
            return ReverseMap.get(direction);
        }
    }

    export function fill(options: PumlWriterOptions): PumlWriterOptions {
        return {
            autoIndex: AutoIndex.AlphaNumIndex,
            arrows: [],
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
