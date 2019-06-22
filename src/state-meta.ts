import { StateType } from './interface'

/**
 * Meta State
 */
export namespace MetaState {
    class AnytimeState implements StateType<any, any> {
        readonly name: string = '*'
        getState(): any {
            throw new Error('AnytimeState');
        }
        toString(): string {
            return this.name;
        }
    }    

    export const Start: undefined = undefined;
    export const StartName: undefined = '[*]' as undefined;
    export const Anytime: undefined = new AnytimeState() as undefined;
}

/**
 * Meta State Action
 */
export namespace MetaStateAction {
    export const DoStart: undefined = undefined;
}
