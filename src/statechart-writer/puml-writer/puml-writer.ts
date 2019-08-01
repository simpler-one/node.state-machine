import { Statechart, StatechartItem } from "../../interface";
import { PumlWriterOptions, ArrowDirection, LeftToRightOption } from "./interface";
import { MetaState } from "../../state-meta";
import { idOf } from "./utils";
import { DirectionMap } from "./direction-map";
import { Transition } from "./transition";
import { Puml } from "./puml";


const StateIndex = 0;
const ActionIndex = 1;

export class PumlWriter {

    private indices: number[];
    private count: number;
    private puml: Puml;
    private readonly directionMap: DirectionMap;
    private readonly actionGetter: (indices: number[], count: number, action: string) => string;

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
            this.setTransitions(transitions.toArray(this.options.autoBundleOutGo, from));
        }

        for (const tr of fromState.transitions) {
            const to = idOf(tr.destination);
            const path = `${from}-path-${to}`;

            const index = this.options.autoIndex(this.indices, ++this.count, tr.action);
            const act = index || tr.action;
            this.puml.newAction(from, tr.action, index);

            const prevTr = transitions.get(path);
            const newTr = Transition.join(prevTr, new Transition(this.count, from, to, act));
            transitions.set(path, newTr);
            this.indices[ActionIndex]++;
        }

        this.puml.nextLine();
        this.indices[StateIndex]++;
    }

    private setTransitions(transitions: Transition[]): void {
        for (const tr of transitions) {
            const direction = this.directionMap.get(tr.from, tr.to);
            this.puml.newTransition(tr.from, tr.to, tr.action, direction);
        }
    }

    private export(chart: Statechart): string {
        const transitions = new Transitions();
        this.init(chart);
        this.setHeads();
        this.setStates();
        this.setTransitions(transitions.toArray());
        return this.puml.toString();
    }
}
