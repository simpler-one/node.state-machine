import { Statechart, StatechartItem } from "../../interface";
import { PumlWriterOptions, ArrowDirection, LeftToRightOption } from "./interface";
import { MetaState } from "../../state-meta";
import { idOf } from "./utils";
import { DirectionMap } from "./direction-map";
import { Puml } from "./puml";


const StateIndex = 0;
const ActionIndex = 1;

export class PumlWriter {

    private indices: number[];
    private count: number;
    private puml: Puml;
    private readonly directionMap: DirectionMap;

    private constructor(
        private readonly map: Statechart,
        private readonly options: PumlWriterOptions,
    ) {
        this.directionMap = new DirectionMap(options);
    }

    public static getWriter(options?: PumlWriterOptions): (map: Statechart) => string {
        const opt = PumlWriterOptions.fill(options);
        return (map) => new PumlWriter(map, opt).export();
    }

    private setHeads(): void {
        if (this.options.leftToRight !== LeftToRightOption.None) {
            this.puml.newHead('left to right direction');
        }
    }

    private setStates(): void {
        this.indices = [0, 0];
        this.count = 0;
        this.puml = new Puml(this.map.name, this.options);

        const start = this.map.states.find(state => state.name === MetaState.StartName);
        const states = this.map.states.filter(state => state.name !== MetaState.StartName);
        this.setStart(start);
        for (const state of states) {
            this.setState(state);
        }
    }

    private setStart(start: StatechartItem): void {
        this.puml.newStart(start.name, idOf(start.transitions[0].destination));
    }

    private setState(fromState: StatechartItem): void {
        this.indices[ActionIndex] = 0;
        const from = idOf(fromState.name);
        this.puml.newDefinition(`state "${fromState.name}" as ${from}`);
        if (fromState.children.length > 0) {
            this.puml.appendDefinition(' {');
            this.puml.indent();
            fromState.children.forEach(child => this.setState(child));
            this.puml.unindent();
            this.puml.newDefinition(`}`);
            this.puml.newDefinition('');
        }

        const transitions = new Map<string, string>();
        for (const tr of fromState.transitions) {
            const to = idOf(tr.destination);
            const path = `${from}-path-${to}`;

            let act: string;
            if (this.options.autoIndex) {
                act = this.options.autoIndex(this.indices, ++this.count);
                this.indices[ActionIndex]++;
                this.puml.newIndexedAction(from, tr.action, act);
            } else {
                act = tr.action;
                this.puml.newAction(from, tr.action);
            }

            let transition = transitions.get(path);
            if (transition) {
                transition += `,${act}`; // Append
            } else {
                const direction = this.directionMap.get(from, to);
                transition = `${from} -${direction}-> ${to}: ${act}`; // New
            }

            transitions.set(path, transition);
        }

        transitions.forEach(transition => {
            this.puml.newTransition(transition);
        });

        this.puml.nextLine();
        this.indices[StateIndex]++;
    }


    private export(): string {
        this.setHeads();
        this.setStates();
        return this.puml.toString();
    }
}
