import { Transition } from './transition';


export class Transitions {

    private readonly map: Map<string, Transition> = Map<string, Transition>();
    
    public add(transition: Transition): void {
        const prevTr = this.map.get(path);
        const newTr = Transition.join(prevTr, new Transition(this.count, from, to, act));
        this.map.set(path, newTr);
    }
    
    public toArray(bundle: boolean = false, from?: string): Transitions[] {
        return bundle ? this.bundle(from) : this.map.values();
    }
    
    private bundle(from: string): Transitions[] {
        const bundler = new Map<string, Transition[]>();
        this.map.forEach(tr => {
            const bundled = bundler.get(tr.from);
            if (bundled) {
                bundled = [];
                bundler.set(tr.from, bundled);
            }
            
            bundled.push(tr);
        });

        const result: Transition[] = [];
        bundler.forEach(transitions => {
            transitions.sort(Transition.compare);
            result.push(Transition.join(...transitions));
        });

        return result;
    }
}
