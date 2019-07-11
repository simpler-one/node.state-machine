// tslint:disable:no-namespace
import { AutoIndex } from "../interface";


export type ArrowDirectionType = 'up' | 'down' | 'left' | 'right' | ArrowDirection;
export enum ArrowDirection {
    Up = 'up',
    Down = 'down',
    Left = 'left',
    Right = 'right',
}
export namespace ArrowDirection {
    const ReverseMap = new Map<ArrowDirectionType, ArrowDirection>([
        [ArrowDirection.Up, ArrowDirection.Down],
        [ArrowDirection.Down, ArrowDirection.Up],
        [ArrowDirection.Left, ArrowDirection.Right],
        [ArrowDirection.Right, ArrowDirection.Left],
    ]);

    export function fromPosition(
        fromX: number, fromY: number, toX: number, toY: number
    ): ArrowDirectionType | undefined {
        const x = toX - fromX;
        const y = toY - fromY;
        const absX = Math.abs(x);
        const absY = Math.abs(y)

        if (absX === 0 && absY === 0) {
            return undefined;
        } else if (absX > absY) {
            return x < 0 ? ArrowDirection.Left : ArrowDirection.Right;
        } else if (absX <= absY) { // prior
            return y < 0 ? ArrowDirection.Up : ArrowDirection.Down;
        }
    }

    export function reverse(direction: ArrowDirectionType): ArrowDirection {
        return ReverseMap.get(direction);
    }
}


export interface PumlWriterOptions {
    autoIndex?: AutoIndex;
    /** Transition arrows */
    arrows?: {
        /** state name */
        from?: string;
        /** state name */
        to?: string;
        /** Arrow direction. This is more prior than positions */
        direction: ArrowDirectionType;
        bothWays?: boolean;
        /* color?: string; reserved for future */
    }[];
    /** State node's position */
    positions?: {
        /** state name */
        state: string;
        /** Relative horizontal position. Larger goes right */
        x?: number;
        /** Relative vertical position. Larger goes right */
        y?: number;
    }[];
}
export namespace PumlWriterOptions {
    export const Model: PumlWriterOptions = {};

    export function fill(options: PumlWriterOptions): PumlWriterOptions {
        return {
            autoIndex: AutoIndex.AlphaNumIndex,
            arrows: [],
            positions: [],
            ...options
        };
    }
}
