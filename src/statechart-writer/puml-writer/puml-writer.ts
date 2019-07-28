import { Statechart, StatechartItem } from "../../interface";
import { PumlWriterOptions, ArrowDirection, LeftToRightOption } from "./interface";
import { MetaState } from "../../state-meta";
import { StringLines } from "./string-lines";


type Position = { x: number, y: number };
const StateIndex = 0;
const ActionIndex = 1;
const NonId = new RegExp([
    ...Array.from(' -=/,:;@%&<>~`\'"'),
    ...Array.from('+|\\[]{}()!?*^').map(c => `\\${c}`),
].join('|'), 'g');
const ZeroPos = {x: 0, y: 0};

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


export class PumlWriter {

    private indices: number[];
    private count: number;
    private heads: StringLines = new StringLines();
    private definitions: StringLines = new StringLines();
    private transitions: StringLines = new StringLines();
    private readonly directionMap: Map<string, ArrowDirection>;
    private readonly positionMap: Map<string, Position>;
    private readonly defaultDirection: ArrowDirection;
    private readonly directionConversion: Map<string, string>;

    private constructor(
        private readonly map: Statechart,
        private readonly options: PumlWriterOptions,
    ) {
        this.directionMap = PumlWriter.getDirectionMap(options.arrows);
        this.positionMap = new Map(
            options.positions.map(pos => [idOf(pos.state), {x: pos.x || 0, y: pos.y || 0}])
        );
        this.defaultDirection = this.directionMap.get(pathOf('', ''));
        
        this.directionConversion = this.options.leftToRight !== LeftToRightOption.AutoPosition
            ? NormalDirectionMap
            : LtoRDirectionMap
        ;
    }

    public static getWriter(options?: PumlWriterOptions): (map: Statechart) => string {
        const opt = PumlWriterOptions.fill(options);
        return (map) => new PumlWriter(map, opt).export();
    }

    private static getDirectionMap(arrows: typeof PumlWriterOptions.Model.arrows): Map<string, ArrowDirection> {
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

    private setHeads(): void {
        if (this.options.leftToRight !== LeftToRightOption.None) {
            this.heads.newLine('left to right direction');
        }
    }

    private setStates(): void {
        this.indices = [0, 0];
        this.count = 0;
        this.definitions = new StringLines(this.options.indentChar, this.options.indentSize);
        this.transitions = new StringLines();

        const start = this.map.states.find(state => state.name === MetaState.StartName);
        const states = this.map.states.filter(state => state.name !== MetaState.StartName);
        this.setStart(start);
        for (const state of states) {
            this.setState(state);
        }
    }

    private setStart(start: StatechartItem): void {
        this.transitions.newLine(`${start.name} --> ${idOf(start.transitions[0].destination)}`);
    }

    private setState(fromState: StatechartItem): void {
        this.indices[ActionIndex] = 0;
        const from = idOf(fromState.name);
        this.definitions.newLine(`state "${fromState.name}" as ${from}`);
        if (fromState.children.length > 0) {
            this.definitions.append(' {');
            this.definitions.indent();
            fromState.children.forEach(child => this.setState(child));
            this.definitions.unindent();
            this.definitions.newLine(`}`);
            this.definitions.newLine();
        }

        const transitions = new Map<string, string>();
        for (const action of fromState.transitions) {
            const to = idOf(action.destination);
            const path = `${from}-path-${to}`;

            let act: string;
            if (this.options.autoIndex) {
                act = this.options.autoIndex(this.indices, ++this.count);
                this.indices[ActionIndex]++;
                this.definitions.newLine(`${from}: ${act} ${action.action}`);
            } else {
                act = action.action;
                this.definitions.newLine(`${from}: ${action.action}`);
            }

            let transition = transitions.get(path);
            if (transition) {
                transition += `,${act}`; // Append
            } else {
                const direction = this.getDirection(from, to);
                transition = `${from} -${direction}-> ${to}: ${act}`; // New
            }

            transitions.set(path, transition);
        }

        transitions.forEach(transition => {
            this.transitions.newLine(transition);
        });

        this.definitions.newLine();
        this.transitions.newLine();
        this.indices[StateIndex]++;
    }

    private getDirection(from: string, to: string): string {
        const fromP = this.positionMap.get(from) || ZeroPos;
        const toP = this.positionMap.get(to) || ZeroPos;

        const candidates = [
            this.directionMap.get(pathOf(from, to)),
            this.directionMap.get(pathOf(from, '')),
            this.directionMap.get(pathOf('', to)),
            ArrowDirection.fromPosition(fromP.x, fromP.y, toP.x, toP.y),
            this.defaultDirection,
            ArrowDirection.Down,
        ];

        return this.directionConversion.get(candidates.find(candidate => candidate));
    }

    private export(): string {
        this.setHeads();
        this.setStates();

        return [
            `@startuml ${this.map.name}`,
            ...this.heads.toArray(),
            '',
            ...this.definitions.toArray(),
            ...this.transitions.toArray(),
            `@enduml`
        ].join('\n');
    }
}


function idOf(name: string): string {
    return name
        .trim()
        .replace(NonId, '_')
    ;
}

function pathOf(from: string, to: string): string {
    return `${from}-path-${to}`;
}
