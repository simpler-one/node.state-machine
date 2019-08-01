import { Transition } from './transition';


export class Transitions {

    private readonly all: Map<string, Transition> = Map<string, Transition>();
    private readonly bundle: Map<string, Transition[]> = Map<string, Transition[]>();
    
    public add(transition: Transition): void {
        const prevTr = this.all.get(path);
        const newTr = Transition.join(prevTr, new Transition(this.count, from, to, act));
        this.all.set(path, newTr);

        let bundled = this.bundle.get(tr.to);
        if (!bundled) {
            bundled = [];
            this.bundle.set(tr.to, bundled);
        }
        
        bundled.push(tr);
    }
}
