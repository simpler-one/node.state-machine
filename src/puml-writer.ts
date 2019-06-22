import { StateMachineMap, StateMachineMapItem } from "./interface";
import { MetaState } from "./state-meta";


export class PumlWriter {

    static getWriter(options?: Options): (map: StateMachineMap) => string {
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
        const fromId: string = idOf(fromState.name);
        this.definitions.push(`state "${fromState.name}" as ${fromId}`);

        for (const action of fromState.actions) {
            const toId = idOf(action.destination);
            if (this.options.autoNumber) {
                const actI = `(${this.actionI++})`;
                this.definitions.push(`${fromId}: ${actI} ${action.name}`);
                this.transitions.push(`${fromId} -${this.options.arrowDirection}-> ${toId}: ${actI}`);
            } else {
                this.definitions.push(`${fromId}: ${action.name}`);
                this.transitions.push(`${fromId} -${this.options.arrowDirection}-> ${toId}: ${action.name}`);
            }
        }

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
