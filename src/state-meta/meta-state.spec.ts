import { Anytime } from './meta-state';
import { StateType } from '../interface';


describe('Anytime', () => {
    describe('getState()', () => {
        it('should throw an error always', () => {
            // Given
            const anytime: StateType<void> = Anytime;
            let error = false;

            try {
                anytime.getState();
            } catch (e) {
                error = true;
            }

            expect(error).toBeTruthy();
        });
    });
});
