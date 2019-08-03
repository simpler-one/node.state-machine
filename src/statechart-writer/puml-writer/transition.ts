import { pathOf } from "./utils";

export class Transition {
    public get path(): string {
        return pathOf(this.from, this.to);
    }

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

    public static join(...transitions: Transition[]): Transition {
        if (!transitions) {
            return undefined;
        }

        const list = transitions.filter(tr => Boolean(tr));
        if (list.length === 0) {
            return undefined;
        }

        return new Transition(
            list[0].order,
            list[0].from,
            list[0].to,
            list.map(tr => tr.action).join(','),
        );
    }

    public newFrom(from: string): Transition {
        return new Transition(
            this.order,
            from,
            this.to,
            this.action,
        );
    }
}
