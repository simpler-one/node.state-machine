export class StateChangeFailedEvent<S, A, P = void> {
    public get current(): S | undefined {
        return this.currentStates[this.currentStates.length - 1];
    }
    public get currentTop(): S | undefined {
        return this.currentStates[0];
    }

    public constructor(
        public readonly currentStates: S[] | [undefined],
        public readonly action: A,
        public readonly params: P,
        public readonly message: string,    
    ) {
    }
}
