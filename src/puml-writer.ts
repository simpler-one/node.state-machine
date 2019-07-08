import { StateMachineMap, StateMachineMapItem, PumlWriterOptions } from "./interface";
import { MetaState } from "./state-meta";


export class PumlWriter {

    public static getWriter(options?: PumlWriterOptions): (map: StateMachineMap) => string {
        const opt = PumlWriterOptions.fill(options);
        return (map) => new PumlWriter(map, opt).export();
    }

    private indices: number[];
    private count: number;
    private definitions: string[] = [];
    private transitions: string[] = [];
    private directionMap: Map<string, string>;

    private constructor(
        private readonly map: StateMachineMap,
        private readonly options: PumlWriterOptions,
    ) {
    }

    private setStates(): void {
        this.indices = new Array(2);
        this.count = 0;
        this.definitions = [];
        this.transitions = [];
        this.directionMap = new Map(
            this.options.arrowDirections.map(direction => {
                const from = direction.from ? idOf(direction.from) : '';
                const to = direction.to ? idOf(direction.to) : '';
                return [`${from}-path-${to}`, direction.direction];
            })
        );

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
        const from = idOf(fromState.name);
        this.definitions.push(`state "${fromState.name}" as ${from}`);

        const transitions = new Map<string, string>();
        for (const action of fromState.actions) {
            const to = idOf(action.destination);
            const path = `${from}-path-${to}`;

            let act: string;
            if (this.options.autoIndex) {
                this.indices[1]++;
                act = this.options.autoIndex(this.indices, ++this.count);
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
    }

    private getDirection(from: string, to: string): string {
        const candidates = [
            this.directionMap.get(pathOf(from, to)),
            this.directionMap.get(pathOf(from, '')),
            this.directionMap.get(pathOf('', to)),
            this.directionMap.get(pathOf('', '')),
            PumlWriterOptions.ArrowDirection.Down,
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
        .replace(/ |-/g, '_')
    ;
    return n.charAt(0).toLowerCase() + n.substr(1);
}

function pathOf(from: string, to: string): string {
    return `${from}-path-${to}`;
}
