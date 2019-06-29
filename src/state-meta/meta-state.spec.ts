import { Anytime } from './meta-state';
import { StateType } from '../interface';
import { StateMachine } from '../state-machine';


describe('Anytime', () => {
    describe('getState()', () => {
        it('should throw an error always', () => {
            // Given
            const anytime: StateType<void, string> = Anytime;
            let error = false;

            try {
                anytime.getState({} as StateMachine<void, string>);
            } catch (e) {
                error = true;
            }

            expect(error).toBeTruthy();
        });
    });
});
