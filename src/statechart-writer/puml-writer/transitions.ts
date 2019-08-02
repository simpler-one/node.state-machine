import { Transition } from './transition';


export class Transitions {

    private readonly map: Map<string, Transition> = new Map<string, Transition>();
    
    public add(path: string, transition: Transition): void {
        const prevTr = this.map.get(path);
        const newTr = Transition.join(prevTr, transition);
        this.map.set(path, newTr);
    }
    
    public toArray(bundle: boolean = false, from?: string): Transition[] {
        return (bundle ? this.bundle(from) : [...this.map.values()])
        .sort(Transition.compare);
    }
    
    private bundle(from: string): Transition[] {
        const bundler = new Map<string, Transition[]>();
        this.map.forEach(tr => {
            let bundled = bundler.get(tr.from);
            if (bundled) {
                bundled = [];
                bundler.set(tr.from, bundled);
            }
            
            bundled.push(tr);
        });

        const result: Transition[] = [];
        bundler.forEach(transitions => {
            transitions.sort(Transition.compare);
            result.push(Transition.join(...transitions).newFrom(from));
        });

        return result;
    }
}
