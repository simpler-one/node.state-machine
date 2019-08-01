export class Transition {
    constructor(
        public readonly order: number,
        public readonly from: string,
        public readonly to: string,
        public readonly action: string,
    ) {
    }
}
