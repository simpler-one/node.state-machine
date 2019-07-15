export class StateChangedEvent<S, A, P = void> {
    public get old(): S | undefined {
        return this.oldStates[this.oldStates.length - 1];
    }
    public get oldTop(): S | undefined {
        return this.oldStates[0];
    }

    public get current(): S | undefined {
        return this.currentStates[this.currentStates.length - 1];
    }
    public get currentTop(): S | undefined {
        return this.currentStates[0];
    }

    public constructor(
        public readonly commonParents: S[] | [],
        public readonly oldStates: S[] | [undefined] | [],
        public readonly currentStates: S[] | [undefined] | [],
        public readonly action: A,
        public readonly params: P,
        public readonly message: string,    
    ) {
    }

    public clone(): StateChangedEvent<S, A, P> {
        return new StateChangedEvent(
            [...this.commonParents],
            [...this.oldStates],
            [...this.currentStates],
            this.action,
            this.params,
            this.message
        )
    }
}
