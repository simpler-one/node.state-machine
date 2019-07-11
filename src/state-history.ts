export class StateHistory<A extends string> {
    public get isError(): boolean {
        return this.newState === undefined;
    }
    
    constructor(
        public readonly date: Date,
        public readonly oldState: string | undefined,
        public readonly newState: string | undefined,
        public readonly action: A,
    ) {
    }
}
