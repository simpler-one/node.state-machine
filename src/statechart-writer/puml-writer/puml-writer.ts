import { StateMachineMap, StateMachineMapItem } from "../../interface";
import { PumlWriterOptions, ArrowDirectionType, ArrowDirection } from "./interface";
import { MetaState } from "../../state-meta";


type Position = { x: number, y: number };
const StateIndex = 0;
const ActionIndex = 1;
const NonId = new RegExp([
    ...Array.from(' -=/,:;@%&<>~`\'"'),
    ...Array.from('+|\\[]{}()!?*^').map(c => `\\${c}`),
].join('|'), 'g');
const ZeroPos = {x: 0, y: 0};

export class PumlWriter {

    private indices: number[];
    private count: number;
    private definitions: string[] = [];
    private transitions: string[] = [];
    private readonly directionMap: Map<string, ArrowDirectionType>;
    private readonly positionMap: Map<string, Position>;
    private readonly defaultDirection: ArrowDirectionType;

    private constructor(
        private readonly map: StateMachineMap,
        private readonly options: PumlWriterOptions,
    ) {
        this.directionMap = PumlWriter.getDirectionMap(options.arrows);
        this.positionMap = new Map(
            options.positions.map(pos => [idOf(pos.state), {x: pos.x || 0, y: pos.y || 0}])
        );
        this.defaultDirection = this.directionMap.get(pathOf('', ''));
    }

    public static getWriter(options?: PumlWriterOptions): (map: StateMachineMap) => string {
        const opt = PumlWriterOptions.fill(options);
        return (map) => new PumlWriter(map, opt).export();
    }

    private static getDirectionMap(arrows: typeof PumlWriterOptions.Model.arrows): Map<string, ArrowDirectionType> {
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

    private setStates(): void {
        this.indices = [0, 0];
        this.count = 0;
        this.definitions = [];
        this.transitions = [];

        const start = this.map.states.find(state => state.name === MetaState.StartName);
        const states = this.map.states.filter(state => state.name !== MetaState.StartName);
        this.setStart(start);
        for (const state of states) {
            this.setState(state);
        }
    }

    private setStart(start: StateMachineMapItem): void {
        this.transitions.push(`${start.name} --> ${idOf(start.actions[0].destination)}`);
    }

    private setState(fromState: StateMachineMapItem): void {
        this.indices[ActionIndex] = 0;
        const from = idOf(fromState.name);
        this.definitions.push(`state "${fromState.name}" as ${from}`);

        const transitions = new Map<string, string>();
        for (const action of fromState.actions) {
            const to = idOf(action.destination);
            const path = `${from}-path-${to}`;

            let act: string;
            if (this.options.autoIndex) {
                act = this.options.autoIndex(this.indices, ++this.count);
                this.indices[ActionIndex]++;
                this.definitions.push(`${from}: ${act} ${action.name}`);
            } else {
                act = action.name;
                this.definitions.push(`${from}: ${action.name}`);
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
            this.transitions.push(transition);
        });

        this.definitions.push('');
        this.transitions.push('');
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

        return candidates.find(candidate => candidate);
    }

    private export(): string {
        this.setStates();

        return [
            `@startuml ${this.map.name}`,
            '',
            ...this.definitions,
            ...this.transitions,
            `@enduml`
        ].join('\n');
    }
}


function idOf(name: string): string {
    const n = name
        .trim()
        .replace(NonId, '_')
    ;
    return n.charAt(0).toLowerCase() + n.substr(1);
}

function pathOf(from: string, to: string): string {
    return `${from}-path-${to}`;
}
