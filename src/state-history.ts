export class StateHistory<A extends string> {
    public get isError(): boolean {
        return this.newState === undefined;
    }


    public static ok<A extends string>(
        commonParents: string[] | [],
        oldState: string[] | [],
        newState: string[] | [] | undefined,
        action: A,
        forced: boolean,
    ): StateHistory<A> {
        return new StateHistory(new Date(), commonParents, oldState, newState, action, forced);
    }

    public static error<A extends string>(
        commonParents: string[] | [],
        oldState: string[] | [],
        action: A,
    ): StateHistory<A> {
        return new StateHistory(new Date(), commonParents, oldState, undefined, action, false);
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
}
