import { StateType } from "./interface";

export class LinkedStateType<S, A extends string, P> {

    public get name(): string {
        return this.type.name;
    }

    public get children(): LinkedStateType<S, A, P>[] {
        return [...this._children];
    }

    public get parents(): LinkedStateType<S, A, P>[] {
        const parents: LinkedStateType<S, A, P>[] = [];
        let parent: LinkedStateType<S, A, P> = this.parent;
        while (parent) {
            parents.push(parent);
            parent = parent.parent;
        } 

        return parents.reverse();
    }

    public get inheritanceChain(): LinkedStateType<S, A, P>[] {
        const chain = this.parents;
        chain.push(this);
        return chain;
    }

    private readonly transitions: Map<A, LinkedStateType<S, A, P>> = new Map();
    private readonly _children: LinkedStateType<S, A, P>[] = [];

    constructor(
        public readonly type: StateType<S, A, P>,
        public readonly parent: LinkedStateType<S, A, P>,
    ) {
        if (parent) {
            parent._children.push(this);
        }
    }

    public when(action: A): LinkedStateType<S, A, P> {
        return this.transitions.get(action);
    }

    public setTransition(action: A, destination: LinkedStateType<S, A, P>): void {
        this.transitions.set(action, destination);
    }

    public mapEntries(): IterableIterator<[A, LinkedStateType<S, A, P>]> {
        return this.transitions.entries();
    }
}
