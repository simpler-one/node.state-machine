import { StateType } from '../interface'


export const StartName = '[*]';
export const AnytimeName = '*';

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