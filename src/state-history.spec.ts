import { StateHistory } from './state-history';

describe('StateHistory', () => {
    describe('isError', () => {
        it('should return false if newState is not undefined', () => {
            // Given
            const history = new StateHistory<string>(new Date(), [], ['old'], ['new'], 'action');

            // When
            const isErr = history.isError;

            // Then
            expect(isErr).toBe(false);
        });

        it('should return true if newState is undefined', () => {
            // Given
            const history = new StateHistory<string>(new Date(), [], ['old'], undefined, 'action');

            // When
            const isErr = history.isError;

            // Then
            expect(isErr).toBe(true);
        });
    });
});
