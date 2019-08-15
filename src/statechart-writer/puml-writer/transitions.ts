import { Transition } from './transition';
import { StatechartItem } from '../../interface';
import { TransitionBundle } from './private-interfaces';
import { pathOf } from './utils';


export class Transitions {

    private readonly map: Map<string, Transition> = new Map<string, Transition>();
    
    public add(...transitions: Transition[]): void {
        for (const tr of transitions) {
            this.addOne(tr);
        }
    }
    
    public bundleAsNeeded(bundle: boolean = false, from?: StatechartItem): TransitionBundle {
        const result = bundle ? this.bundle(from) : { transitions: [...this.map.values()], bundlers: [] };
        result.transitions.sort(Transition.compare);
        return result;
    }

    private addOne(transition: Transition): void {
        const prevTr = this.map.get(transition.path);
        const newTr = Transition.join(prevTr, transition);
        this.map.set(transition.path, newTr);
    }

    private bundle(from: StatechartItem): TransitionBundle {
        const internals = new Set<string>(getNameList(from));

        const bundler = new Map<string, Transition[]>();
        this.map.forEach(tr => {
            let bundled = bundler.get(tr.to);
            if (!bundled) {
                bundled = [];
                bundler.set(tr.to, bundled);
            }
            
            bundled.push(tr);
        });

        const result: TransitionBundle = {
            transitions: [],
            bundlers: [],
        };
        bundler.forEach((transitions, to) => {
            if (transitions.length === 1 || internals.has(to)) {
                result.transitions.push(...transitions); // No bundle
                return; // continue
            }

            transitions.sort(Transition.compare);
            const bundler = `__bundler_${from.name}_${to}_`;
            result.transitions.push(...transitions.map(tr => tr.newDestination(bundler)));
            result.transitions.push(new Transition(-1, bundler, to, ''));
            result.bundlers.push(bundler);
        });

        return result;
    }
}

function getNameList(state: StatechartItem, result: string[] = []): string[] {
    result.push(state.name);
    state.children.forEach(child => getNameList(child, result));
    return result;
}
