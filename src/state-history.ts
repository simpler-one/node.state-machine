export class StateHistory<A extends string> {
    public get isError(): boolean {
        return this.newState === undefined;
    }
    
    constructor(
        public readonly oldState: string,
        public readonly newState: string,
        public readonly action: A,
    ) {
    }
}
