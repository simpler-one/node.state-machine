export class Transition {
    public constructor(
        public readonly order: number,
        public readonly from: string,
        public readonly to: string,
        public readonly action: string,
    ) {
    }

    public appendAction(action: string): Transition {
        return new Transition(
            this.order,
            this.from,
            this.to,
            this.action + ',' + action,
        );
    }
}
