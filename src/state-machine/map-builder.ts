import { LinkedStateType } from './linked-state-type';
import { StateType } from '../interface';
import { NolItem } from '../private-interface';


export class MapBuilder<S, A extends string, P> {

    private readonly map: Map<string, LinkedStateType<S, A, P>> = new Map();
    private readonly itemMap: Map<string, NolItem<S, A, P>> = new Map();
    private readonly typeMap: Map<string, StateType<S, A, P>> = new Map();
    private readonly parentMap: Map<string, StateType<S, A, P>> = new Map();

    public static build<S, A extends string, P>(
        items: NolItem<S, A, P>[],
        anytimeTransitions: [A, StateType<S, A, P>][],
    ): Map<string, LinkedStateType<S, A, P>> {
        const builder = new MapBuilder<S, A, P>(anytimeTransitions);
        builder.build(items);
        return builder.map;
    }

    constructor(
        private readonly anytime: [A, StateType<S, A, P>][],
    ) {
    }

    private build(items: NolItem<S, A, P>[]): void {
        this.buildBaseMaps(items);

        for (const name of this.typeMap.keys()) {
            this.setType(name);
        }

        for (const item of this.itemMap.values()) {
            this.setLink(item);
        }
    }


    private buildBaseMaps(items: NolItem<S, A, P>[]): void {
        for (const item of items) {
            this.itemMap.set(item.state.name, item);
            this.typeMap.set(item.state.name, item.state);
            for (const transition of item.transitions) {
                this.typeMap.set(transition[1].name, transition[1]);
            }

            if (item.children) {
                this.buildBaseMaps(item.children); // Recursive
                for (const child of item.children) {
                    this.parentMap.set(child.state.name, item.state);
                }
            }
        }

        for (const transition of this.anytime) {
            this.typeMap.set(transition[1].name, transition[1]);
        }
    }

    private setType(name: string): LinkedStateType<S, A, P> {
        let type = this.map.get(name);
        if (type) {
            return type;
        }

        let parent: LinkedStateType<S, A, P> = undefined;
        const parentType = this.parentMap.get(name);
        if (parentType) {
            parent = this.map.get(parentType.name);
            if (!parent) {
                parent = this.setType(parentType.name); // Recursive
            }
        }

        type = new LinkedStateType(this.typeMap.get(name), parent);
        this.map.set(name, type);
        return type;
    }

    private setLink(item: NolItem<S, A, P>): void {
        const type = this.map.get(item.state.name);
        for (const tr of [...item.transitions, ...this.anytime]) {
            type.setTransition(tr[0], this.map.get(tr[1].name));
        }

        if (item.startChild) {
            type.setStartChild(item.startChild.name);
        }
    }
}
