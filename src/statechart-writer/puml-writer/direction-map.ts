import { PumlWriterOptions, ArrowDirection, LeftToRightOption } from "./interface";
import { idOf, pathOf } from "./utils";


type Position = { x: number, y: number };
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

    public get(from: string, to: string): string {
        const fromP = this.positions.get(from) || ZeroPos;
        const toP = this.positions.get(to) || ZeroPos;

        const candidates = [
            this.arrows.get(pathOf(from, to)),
            this.arrows.get(pathOf(from, '')),
            this.arrows.get(pathOf('', to)),
            ArrowDirection.fromPosition(fromP.x, fromP.y, toP.x, toP.y),
            this.defaultDirection,
            ArrowDirection.Down,
        ];

        return this.conversion.get(candidates.find(candidate => candidate));
    }

    private static buildArrows(arrows: typeof PumlWriterOptions.Model.arrows): Map<string, ArrowDirection> {
        const map = new Map();
        for (const arrow of arrows) {
            const from = arrow.from ? idOf(arrow.from) : '';
            const to = arrow.to ? idOf(arrow.to) : '';
            map.set(`${from}-path-${to}`, arrow.direction);
            if (arrow.bothWays && (arrow.from || arrow.to)) {
                map.set(`${to}-path-${from}`, ArrowDirection.reverse(arrow.direction));
            }
        }

        return map;
    }
}
