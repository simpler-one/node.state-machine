import { StateType, StateMachineItem } from "../../interface";
import { MetaState } from "../../state-meta";
import { NolItem } from "../../private-interface";


export abstract class TypeGetter<S, A extends string> {
    private map: Map<string, StateType<S, A>> = new Map();

    public get(state: S): StateType<S, A> {
        if (state === undefined) {
            return undefined;
        }

        if (state === MetaState.Anytime) {
            return MetaState.Anytime;
        }

        const name = this.nameOf(state);
        let type = this.map.get(name);
        if (!type) {
            type = this.wrap(state);
            this.map.set(name, type);
        }

        return type;
    }

    public convert(items: StateMachineItem<S, A>[]): NolItem<S, A>[] {
        if (!items) {
            return undefined;
        }

        return items.map(item => this.convertOne(item));
    }

    private convertOne(item: StateMachineItem<S, A>): NolItem<S, A> {
        return {
            state: this.get(item.state),
            transitions: item.transitions.map(tr => [tr[0], this.get(tr[1])] as [A, StateType<S, A>]),
            children: this.convert(item.children),
            startChild: this.get(item.startChild),
        };
    }

    protected abstract nameOf(state: S): string;
    protected abstract wrap(state: S): StateType<S, A>;
}
