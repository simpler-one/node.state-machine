import { Transition } from './transition';


export class Transitions {

    private readonly map: Map<string, Transition> = new Map<string, Transition>();
    
    public add(...transitions: Transition[]): void {
        for (const tr of transitions) {
            this.addOne(tr);
        }
    }
    
    public toArray(bundle: boolean = false, from?: string): Transition[] {
        return (bundle ? this.bundle(from) : [...this.map.values()])
        .sort(Transition.compare);
    }

    private addOne(transition: Transition): void {
        const prevTr = this.map.get(transition.path);
        const newTr = Transition.join(prevTr, transition);
        this.map.set(transition.path, newTr);
    }

    private bundle(from: string): Transition[] {
        const bundler = new Map<string, Transition[]>();
        this.map.forEach(tr => {
            let bundled = bundler.get(tr.to);
            if (!bundled) {
                bundled = [];
                bundler.set(tr.to, bundled);
            }
            
            bundled.push(tr);
        });

        const result: Transition[] = [];
        bundler.forEach(transitions => {
            if (transitions.length === 1) {
                result.push(transitions[0]); // No bundle
                return; // continue
            }

            transitions.sort(Transition.compare);
            result.push(Transition.join(...transitions).newFrom(from));
        });

        return result;
    }
}
