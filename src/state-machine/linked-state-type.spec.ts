import { LinkedStateType } from './linked-state-type'
import { StateType } from '../interface';

class SType implements StateType<string, string> {
    getState() { return undefined };

    constructor(
        public readonly name: string,
    ) {
    }
}

describe('LinkedStateType', () => {
    describe('findLeaf', () => {
        it('should return the child as a leaf', () => {
            // Given
            const type = new LinkedStateType(new SType('A'), undefined);
            const child = new LinkedStateType(new SType('B'), type);
            type.setStartChild(child.name);

            // When
            const result = type.findLeaf();

            // Then
            expect(result).toBe(child);
        })
    });
});
