import { StateMachineMap, StateMachineMapItem } from "./interface";
import { MetaState } from "./state-meta";


export class PumlWriter {

    public static getWriter(options?: Options): (map: StateMachineMap) => string {
        const opt = Options.fill(options);
        return (map) => new PumlWriter(map, opt).export();
    }

    private actionI: number = 1;
    private definitions: string[] = [];
    private transitions: string[] = [];

    private constructor(
        private readonly map: StateMachineMap,
        private readonly options: Options
    ) {
    }

    private setStates(): void {
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
        const fromId = idOf(fromState.name);
        this.definitions.push(`state "${fromState.name}" as ${fromId}`);

        const transitions = new Map<string, string>();
        for (const action of fromState.actions) {
            const toId = idOf(action.destination);
            const path = `${fromId}-${toId}`;

            let act: string;
            if (this.options.autoNumber) {
                act = `(${this.actionI++})`;
                this.definitions.push(`${fromId}: ${act} ${action.name}`);
            } else {
                act = action.name;
                this.definitions.push(`${fromId}: ${action.name}`);
            }

            let transition = transitions.get(path);
            if (transition) {
                transition += `,${act}`; // Append
            } else {
                transition = `${fromId} -${this.options.arrowDirection}-> ${toId}: ${act}`; // New
            }

            transitions.set(path, transition);
        }

        transitions.forEach(transition => {
            this.transitions.push(transition);
        });

        this.definitions.push('');
        this.transitions.push('');
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


export interface Options {
    autoNumber?: boolean;
    arrowDirection?: string;
}
// tslint:disable-next-line:no-namespace
namespace Options {
    export function fill(options: Options): Options {
        return {
            autoNumber: false,
            arrowDirection: 'down',
            ...options
        } as Options;
    }
}


function idOf(name: string): string {
    const n = name
        .trim()
        .replace(/ |-/g, '_')
    ;
    return n.charAt(0).toLowerCase() + n.substr(1);
}
