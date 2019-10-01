import { Anytime, StartType } from "./meta-state";
import { StateType } from "../interface";
import { StateMachine } from "../state-machine";
import { MetaAnytimeStateName, MetaStartStateName } from "@working-sloth/statechart-interface";



describe("StartType", () => {
    const start: StateType<string, string> = StartType;
    it("getState()", () => {
        expect(start.getState(undefined, undefined)).toBe(undefined);
    });

    it("toString()", () => {
        expect(start.toString()).toBe(MetaStartStateName);
    });
});


describe("Anytime", () => {
    describe("getState()", () => {
        it("should throw an error always", () => {
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

    it("toString()", () => {
        const anytime: {} = Anytime;
        expect(anytime.toString()).toBe(MetaAnytimeStateName);
    });
});
