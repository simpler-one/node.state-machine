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
        private readonly options: PumlWriterOptions,
    ) {
        this.directionMap = new DirectionMap(options);
    }

    public static getWriter(options?: PumlWriterOptions): (chart: Statechart) => string {
        const opt = PumlWriterOptions.fill(options);
        const writer = new PumlWriter(opt);
        return (chart) => writer.export(chart);
    }

    private setHeads(): void {
        if (this.options.leftToRight !== LeftToRightOption.None) {
            this.puml.newHead('left to right direction');
        }
    }

    private init(chart: Statechart): void {
        this.indices = [0, 0];
        this.count = 0;
        this.puml = new Puml(chart.name, this.options);
    }

    private setStates(states: StatechartItem[]): void {
        const start = states.find(state => state.name === MetaState.StartName);
        const states = states.filter(state => state.name !== MetaState.StartName);

        if (start) {
            this.puml.newStart(start.name, idOf(start.transitions[0].destination));
        }

        for (const state of states) {
            this.setState(state, new Map<string, Transition>());
        }
    }

    private setState(fromState: StatechartItem, transitions: Map<string, Transition>): void {
        this.indices[ActionIndex] = 0;
        const from = idOf(fromState.name);

        this.puml.newDefinition(`state "${fromState.name}" as ${from}`);
        if (fromState.children.length > 0) {
            this.puml.openBlock();
            this.setStates(fromState.children, transitions);
            this.puml.closeBlock();
        }

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
                transition = transition.appendAction(act);
            } else {
                transition = new Transition(this.count, from, to, act);
            }

            transitions.set(path, transition);
        }

        transitions.values().sort((tr1, tr2) => tr1.order - tr2.order).forEach(tr => {
            const direction = this.directionMap.get(tr.from, tr.to);
            this.puml.newTransition(tr.from, tr.to, tr.action, direction);
        });

        this.puml.nextLine();
        this.indices[StateIndex]++;
    }


    private export(chart: Statechart): string {
        this.init(chart);
        this.setHeads();
        this.setStates();
        return this.puml.toString();
    }
}
