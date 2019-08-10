import { PumlWriterOptions, ArrowDirection, LeftToRightOption } from "./interface";
import { idOf, pathOf } from "./utils";


type Position = { x: number, y: number };
type DirectionGetter = () => string | undefined;
const ZeroPos: Position = {x: 0, y: 0};

const NormalDirectionMap = new Map([
    [ArrowDirection.Up, ArrowDirection.Up],
    [ArrowDirection.Down, ArrowDirection.Down],
    [ArrowDirection.Do, ArrowDirection.Do],
    [ArrowDirection.Left, ArrowDirection.Left],
    [ArrowDirection.Right, ArrowDirection.Right],
    [ArrowDirection.Le, ArrowDirection.Le],
    [ArrowDirection.Ri, ArrowDirection.Ri],
]);
const LtoRDirectionMap = new Map([
    [ArrowDirection.Up, ArrowDirection.Left],
    [ArrowDirection.Down, ArrowDirection.Right],
    [ArrowDirection.Do, ArrowDirection.Ri],
    [ArrowDirection.Left, ArrowDirection.Up],
    [ArrowDirection.Right, ArrowDirection.Down],
    [ArrowDirection.Le, ArrowDirection.Up],
    [ArrowDirection.Ri, ArrowDirection.Do],
]);

export class DirectionMap {

    private readonly arrows: Map<string, ArrowDirection>;
    private readonly positions: Map<string, Position>;
    private readonly defaultDirection: ArrowDirection;
    private readonly conversion: Map<string, string>;

    constructor(
        options: PumlWriterOptions,
    ) {
        this.arrows = DirectionMap.buildArrows(options.arrows);
        this.positions = new Map(
            options.positions.map(pos => [idOf(pos.state), {x: pos.x || 0, y: pos.y || 0}])
        );
        this.defaultDirection = this.arrows.get(pathOf('', ''));
        
        this.conversion = options.leftToRight !== LeftToRightOption.AutoPosition
            ? NormalDirectionMap
            : LtoRDirectionMap
        ;
    }

    private static buildArrows(arrows: typeof PumlWriterOptions.Model.arrows): Map<string, ArrowDirection> {
        const map = new Map();
        for (const arrow of arrows) {
            const from = arrow.from ? idOf(arrow.from) : '';
            const to = arrow.to ? idOf(arrow.to) : '';
            map.set(pathOf(from, to), arrow.direction);
            if (arrow.bothWays && (arrow.from || arrow.to)) {
                map.set(pathOf(to, from), ArrowDirection.reverse(arrow.direction));
            }
        }

        return map;
    }

    public get(from: string[], to: string[]): string {
        const candidates = [
            ...this.fromPath(from[from.length - 1], to[to.length - 1]),
            ...this.fromPosition(from, to),
            () => this.defaultDirection,
            () => ArrowDirection.Down,
        ];

        return this.conversion.get(candidates.reduce((prev, cur) => prev || cur(), ''));
    }

    private fromPath(from: string, to: string): DirectionGetter[] {
        return [
            () => this.arrows.get(pathOf(from, to)),
            () => this.arrows.get(pathOf(from, '')),
            () => this.arrows.get(pathOf('', to)),
        ];
    }

    private fromPosition(from: string[], to: string[]): DirectionGetter[] {
        return [
            () => {
                const fromP = this.positionOf(from);
                const toP = this.positionOf(to);
                return ArrowDirection.fromPosition(fromP.x, fromP.y, toP.x, toP.y)
            },
        ];
    }

    private positionOf(stateChain: string[]): Position {
        let pos: Position = { x: 0, y: 0 };
        for (const state of stateChain) {
            const curPos = this.positions.get(state) || ZeroPos;
            pos.x += curPos.x;
            pos.y += curPos.y;
        }

        return pos;
    }
}
