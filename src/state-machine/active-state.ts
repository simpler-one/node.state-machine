import { LinkedStateType } from "./linked-state-type";


export class ActiveState<S, A extends string, P> {
    public get name(): string {
        return this.linked.type.name;
    }

    constructor(
        public readonly linked: LinkedStateType<S, A, P>,
        public readonly instance: S,
    ) {
    }
}
