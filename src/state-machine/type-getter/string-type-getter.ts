import { StateType } from "../../interface";
import { StringType } from "../type-wrapper";
import { TypeGetter } from "./type-getter";

export class StringTypeGetter<S extends string, A extends string> extends TypeGetter<S, A> {
    protected nameOf(state: S): string {
        return state;
    }
    protected wrap(state: S): StateType<S, A> {
        return new StringType(state);
    }
}
