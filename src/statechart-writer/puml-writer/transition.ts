export class Transition {
    public constructor(
        public readonly order: number,
        public readonly from: string,
        public readonly to: string,
        public readonly action: string,
    ) {
    }
    
    public static compare(tr1: Transition, tr2: Transition): number {
        return tr1.order - tr2.order;
    }

    public static join(tr1: Transition, tr2: Transition): Transition {
        return tr1 ?
            new Transition(
                tr1.order,
                tr1.from,
                tr1.to,
                tr1.action + ',' + tr2.action,
            )
            : tr2
        ;
    }
}
