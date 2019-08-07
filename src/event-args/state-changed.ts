export class StateChangedEvent<S, A, P = void> {
    public get old(): S | undefined {
        return this.oldStates[this.oldStates.length - 1];
    }
    public get oldRoot(): S | undefined {
        return this.oldStates[0];
    }

    public get new(): S | undefined {
        return this.newStates[this.newStates.length - 1];
    }
    public get newRoot(): S | undefined {
        return this.newStates[0];
    }

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
