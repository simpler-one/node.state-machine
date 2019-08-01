export class Transition {
    public constructor(
        public readonly order: number,
        public readonly from: string,
        public readonly to: string,
        public readonly action: string,
    ) {
    }
    
    public static compare(transition1: Transition, transition2: Transition): number {
        return transition1.order - transition2.order;
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
