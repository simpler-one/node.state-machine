export class StateHistory<A extends string> {
    public get isError(): boolean {
        return this.newState === undefined;
    }

    constructor(
        public readonly date: Date,
        public readonly commonParents: string[] | [],
        public readonly oldState: string[] | [],
        public readonly newState: string[] | [] | undefined,
        public readonly action: A,
        public readonly forced: boolean,
    ) {
    }

    public static ok<A extends string>(
        commonParents: string[] | [],
        oldState: string[] | [],
        newState: string[] | [] | undefined,
        action: A,
        forced: boolean,
    ) {
        return new StateHistory(new Date(), commonParents, oldState, newState, action, forced);
    }

    public static error<A extends string>(
        commonParents: string[] | [],
        oldState: string[] | [],
        action: A,
    ) {
        return new StateHistory(new Date(), commonParents, oldState, undefined, action, false);
    }
}
