import { LinkedStateType } from './linked-state-type';
import { StateType } from '../interface';
import { Item } from '../private-interface';


export class MapBuilder<S, A extends string, P> {

    private readonly map: Map<string, LinkedStateType<S, A, P>> = new Map();
    private readonly nameToType: Map<string, StateType<S, A, P>> = new Map();
    private readonly nameToParent: Map<string, StateType<S, A, P>> = new Map();

    public static build<S, A extends string, P>(
        items: Item<S, A, P>[],
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

    private build(items: Item<S, A, P>[]): void {
        for (const item of items) {
            this.nameToType.set(item.state.name, item.state);
            for (const transition of item.transitions) {
                this.nameToType.set(transition[1].name, transition[1]);
            }
        }

        for (const transition of this.anytime) {
            this.nameToType.set(transition[1].name, transition[1]);
        }

        items
        .filter(item => item.children)
        .forEach(item => {
            const type = this.nameToType.get(item.state.name);
            item.children.forEach(child => {
                this.nameToParent.set(child.state.name, type);
            })
        });

        for (const name of this.nameToType.keys()) {
            this.setType(name);
        }

        for (const item of items) {
            const type = this.map.get(item.state.name);
            for (const tr of [...item.transitions, ...this.anytime]) {
                type.setTransition(tr[0], this.map.get(tr[1].name));
            }

            if (item.startChild) {
                type.setStartChild(item.startChild.name);
            }
        }
    }

    private setType(name: string): LinkedStateType<S, A, P> {
        let type = this.map.get(name);
        if (type) {
            return type;
        }

        let parent: LinkedStateType<S, A, P> = undefined;
        const parentType = this.nameToParent.get(name);
        if (parentType) {
            parent = this.map.get(parentType.name);
            if (!parent) {
                parent = this.setType(parentType.name); // Recursive
            }
        }

        type = new LinkedStateType(this.nameToType.get(name), parent);
        this.map.set(name, type);
        return type;
    }
}
