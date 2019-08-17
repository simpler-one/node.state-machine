export class StateChangedEvent<S, A, P = {}> {
    /** The old removed state. This is same as previous if some states have been removed */
    public get old(): S | undefined {
        return this.oldStates[this.oldStates.length - 1];
    }
    /** The new added state. This is same as current if some states have been added */
    public get new(): S | undefined {
        return this.newStates[this.newStates.length - 1];
    }

    /** Current states including not-changed and old removed */
    public get previousStates(): S[] {
        return [...this.commonParents, ...this.oldStates];
    }
    /** Current states including not-changed and new added */
    public get currentStates(): S[] {
        return [...this.commonParents, ...this.newStates];
    }

    /** The previous leaf state */
    public get previous(): S {
        return this.previousStates[this.commonParents.length + this.oldStates.length - 1];
    }
    /** The current leaf state */
    public get current(): S {
        return this.currentStates[this.commonParents.length + this.newStates.length - 1];
    }

    /** The previous root state */
    public get previousRoot(): S {
        return this.previousStates[0];
    }
    /** The current root state */
    public get currentRoot(): S {
        return this.currentStates[0];
    }

    /**
     * @param oldStates The old removed states
     * @param newStates The new added states
     */
    public constructor(
        public readonly commonParents: S[] | [],
        public readonly oldStates: S[] | [undefined] | [],
        public readonly newStates: S[] | [undefined] | [],
        public readonly action: A,
        public readonly params: P,
        public readonly forced: boolean,
        public readonly message: string,    
    ) {
    }
}
