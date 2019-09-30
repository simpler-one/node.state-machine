import { TypeGetter } from "./type-getter";
import { NamedState, StateType } from "../../interface";
import { NamedType } from "../type-wrapper";


export class NamedTypeGetter<S extends NamedState, A extends string> extends TypeGetter<S, A> {
    protected nameOf(state: S): string {
        return state.name;
    }
    protected wrap(state: S): StateType<S, A> {
        return new NamedType(state);
    }
}
