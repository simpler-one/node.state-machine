import { OnEnterState, OnLeaveState } from "./interface";

describe("interface.OnEnterState", () => {
    describe("get()", () => {
        it("should return function", () => {
            // Given
            const obj = { onEnterState: () => undefined };
            // When
            const result =  OnEnterState.get(obj);
            // Then
            expect(result).toBeTruthy();
        });
    });
});

describe("interface.OnLeaveState", () => {
    describe("get()", () => {
        it("should return function", () => {
            // Given
            const obj = { onLeaveState: () => undefined };
            // When
            const result =  OnLeaveState.get(obj);
            // Then
            expect(result).toBeTruthy();
        });
    });
});
