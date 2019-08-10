import { Statechart, StatechartItem } from "../../interface";
import { PumlWriterOptions, ArrowDirection, LeftToRightOption } from "./interface";
import { MetaState } from "../../state-meta";
import { idOf } from "./utils";
import { DirectionMap } from "./direction-map";
import { Transition } from "./transition";
import { Transitions } from "./transitions";
import { Puml } from "./puml";


const StateIndex = 0;
const ActionIndex = 1;

export class PumlWriter {

    private indices: number[];
    private count: number;
    private puml: Puml;
    private parentMap: Map<string, string>;
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

    private setOptions(): void {
        if (this.options.leftToRight !== LeftToRightOption.None) {
            this.puml.newHead('left to right direction');
        }
    }

    private init(chart: Statechart): void {
        this.indices = [0, 0];
        this.count = 0;
        this.puml = new Puml(chart.name, this.options);
        this.parentMap = new Map();
        this.setMap(chart.states, undefined);
    }

    private setMap(states: StatechartItem[], parent: string): void {
        for (const state of states) {
            if (parent) {
                this.parentMap.set(state.name, parent);
            }

            this.setMap(state.children, state.name);
        }
    }

    private setStates(states: StatechartItem[], transitions: Transitions): void {
        const start = states.find(state => state.name === MetaState.StartName);
        const normalStates = states.filter(state => state.name !== MetaState.StartName);

        if (start) {
            this.puml.newStart(start.name, idOf(start.transitions[0].destination));
        }

        for (const state of normalStates) {
            this.setState(state, transitions);
        }
    }

    private setState(fromState: StatechartItem, transitions: Transitions): void {
        this.indices[ActionIndex] = 0;
        const from = idOf(fromState.name);

        for (const tr of fromState.transitions) {
            const to = idOf(tr.destination);

            const index = this.options.autoIndex(this.indices, ++this.count);
            const act = index || tr.action;
            this.puml.newAction(from, tr.action, index);

            transitions.add(new Transition(this.count, from, to, act));
            this.indices[ActionIndex]++;
        }

        this.puml.newDefinition(fromState.name, from);
        if (fromState.children.length > 0) {
            const childrenTr = new Transitions();
            this.puml.openBlock();
            this.setStates(fromState.children, childrenTr);

            const bundle = childrenTr.bundleAsNeeded(this.options.autoBundleOutgo, fromState);
            this.puml.newBundlers(...bundle.bundlers);
            transitions.add(...bundle.transitions);

            this.puml.closeBlock();
        }

        this.puml.nextDefinition();
        this.indices[StateIndex]++;
    }

    private setTransitions(transitions: Transition[]): void {
        for (const tr of transitions) {
            const direction = this.directionMap.get(this.chainOf(tr.from), this.chainOf(tr.to));
            this.puml.newTransition(tr.from, tr.to, tr.action, direction);
        }
    }

    private export(chart: Statechart): string {
        const transitions = new Transitions();
        this.init(chart);
        this.setOptions();
        this.setStates(chart.states, transitions);
        this.setTransitions(transitions.bundleAsNeeded().transitions);
        return this.puml.toString();
    }

    private chainOf(state: string): string[] {
        const chain: string[] = [];
        let cur = state;
        do {
            chain.push(cur);
            cur = this.parentMap.get(cur);
        } while (cur);

        return chain;
    }
}
