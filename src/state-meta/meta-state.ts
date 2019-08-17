import { MetaStartStateName, MetaAnytimeStateName } from '@working-sloth/statechart-interface'
import { StateType } from '../interface'


// tslint:disable-next-line:max-classes-per-file
class StringState implements StateType<undefined, string> {
    public readonly name: string = MetaStartStateName;
    public getState(): undefined {
        return undefined;
    }
    public toString(): string {
        return MetaStartStateName;
    }
}

// tslint:disable-next-line:max-classes-per-file
class AnytimeState implements StateType<void, string> {
    public readonly name: string = MetaAnytimeStateName;
    public getState(): void {
        throw new Error('AnytimeState');
    }
    public toString(): string {
        return MetaAnytimeStateName;
    }
}    

export const Start: undefined = undefined;
export const StartType: undefined = new StringState() as undefined;
export const Anytime: undefined = new AnytimeState() as undefined;
