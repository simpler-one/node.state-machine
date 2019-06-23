import { StateType } from './interface'

/**
 * Meta State
 */
export namespace MetaState {
    export const StartName: string = '[*]';
    export const AnytimeName: string = '*';

    class AnytimeState implements StateType<{}, {}> {
        public readonly name: string = AnytimeName;
        public getState(): {} {
            throw new Error('AnytimeState');
        }
        public toString(): string {
            return AnytimeName;
        }
    }    

    export const Start: undefined = undefined;
    export const Anytime: undefined = new AnytimeState() as undefined;
}

/**
 * Meta State Action
 */
export namespace MetaStateAction {
    export const DoStart: undefined = undefined;
}
