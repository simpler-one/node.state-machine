import { StateType } from '../interface'


export const StartName = '[*]';
export const AnytimeName = '*';


// tslint:disable-next-line:max-classes-per-file
class StringState implements StateType<undefined, string> {
    public readonly name: string = StartName;
    public getState(): undefined {
        return undefined;
    }
    public toString(): string {
        return StartName;
    }
}

// tslint:disable-next-line:max-classes-per-file
class AnytimeState implements StateType<void, string> {
    public readonly name: string = AnytimeName;
    public getState(): void {
        throw new Error('AnytimeState');
    }
    public toString(): string {
        return AnytimeName;
    }
}    

export const Start: undefined = undefined;
export const StartType: undefined = new StringState() as undefined;
export const Anytime: undefined = new AnytimeState() as undefined;
