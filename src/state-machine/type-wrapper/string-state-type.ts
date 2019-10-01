import { StateType } from "../../interface";

export class StringType<S extends string, A extends string> implements StateType<S, A> {
    public get name(): string {
        return this.state;
    }

    constructor(
        private readonly state: S
    ) {
    }

    public getState(): S {
        return this.state;
    }
}
