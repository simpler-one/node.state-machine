// tslint:disable:no-namespace
import { AutoIndex } from "../interface";


export type ArrowDirection = 'up' | 'down' | 'left' | 'right' | 'do' | 'le' | 'ri';
export namespace ArrowDirection {
    export const
        Up = 'up',
        Down = 'down',
        Left = 'left',
        Right = 'right',
        Do = 'do',
        Le = 'le',
        Ri = 'ri'
    ;

    const ReverseMap = new Map<ArrowDirection, ArrowDirection>([
        [Up, Down],
        [Down, Up],
        [Left, Right],
        [Right, Left],
        [Do, Up],
        [Le, Ri],
        [Ri, Le],
    ]);

    export function fromPosition(
        fromX: number, fromY: number, toX: number, toY: number
    ): ArrowDirection | undefined {
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

    export function reverse(direction: ArrowDirection): ArrowDirection {
        return ReverseMap.get(direction);
    }
}


export enum LeftToRightOption {
    None,
    JustInsert,
    AutoPosition,
}


export interface PumlWriterOptions {
    autoIndex?: AutoIndex;
    autoBundleOutgo?: boolean;
    indentChar?: string;
    indentSize?: number;
    leftToRight?: LeftToRightOption;
    /** Transition arrows */
    arrows?: {
        /** state name */
        from?: string;
        /** state name */
        to?: string;
        /** Arrow direction. This is more prior than state position */
        direction: ArrowDirection;
        bothWays?: boolean;
        /* color?: string; reserved for future */
    }[];
    /** State node's attributes */
    states?: {
        /** state name */
        name: string;
        /** Relative horizontal position. Larger goes right */
        x?: number;
        /** Relative vertical position. Larger goes right */
        y?: number;
        /** Inner direction */
        innerDirection: ArrowDirection;
    }[];
}
export namespace PumlWriterOptions {
    export const Model: PumlWriterOptions = {};
    const DefaultIndent = 4;

    export function fill(options: PumlWriterOptions): PumlWriterOptions {
        // Default
        const opt = {
            autoIndex: AutoIndex.AlphaNumIndex,
            autoBundleOutgo: false,
            indentChar: ' ',
            indentSize: DefaultIndent,
            leftToRight: LeftToRightOption.None,
            ...options
        };

        // Not null
        opt.autoIndex = opt.autoIndex || AutoIndex.None;
        opt.arrows = opt.arrows || [];
        opt.positions = opt.positions || [];

        return opt;
    }
}
