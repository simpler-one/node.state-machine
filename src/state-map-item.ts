import { StateType } from "./interface";

export class StateMapItem<S, A extends string, P> {

    public get name(): string {
        return this.type.name;
    }

    private readonly transitionMap: Map<A, StateMapItem<S, A, P>> = new Map();

    constructor(
        public readonly type: StateType<S, A, P>,
        public readonly parent: StateMapItem<S, A, P>,
    ) {
    }

    public when(action: A): StateMapItem<S, A, P> {
        return this.transitionMap.get(action);
    }

    public setTransition(action: A, destination: StateMapItem<S, A, P>): void {
        this.transitionMap.set(action, destination);
    }

    public mapEntries(): IterableIterator<[A, StateMapItem<S, A, P>]> {
        return this.transitionMap.entries();
    }
}
