import { StateChangedEvent } from "./state-changed";
import { buildDataMatrix } from "@working-sloth/data-matrix";

describe("StateChangedEvent", () => {
    const CommonStates = ["0"];
    const OldStates = ["1", "2", "3"];
    const NewStates = ["4", "5"];
    const Arg = new StateChangedEvent(CommonStates, OldStates, NewStates, "action", undefined, false, "message");

    type Test = { label: string, input: {}, expect: {} };
    const tests = buildDataMatrix<Test>([
        "label              input               expect"
    ], [
        ["old",             Arg.old,            "3"],
        ["new",             Arg.new,            "5"],
        ["previousStates",  Arg.previousStates, ["0", "1", "2", "3"]],
        ["currentStates",   Arg.currentStates,  ["0", "4", "5"]],
        ["previous",        Arg.previous,       "3"],
        ["current",         Arg.current,        "5"],
        ["previousRoot",    Arg.previousRoot,   "0"],
        ["currentRoot",     Arg.currentRoot,    "0"],
    ]);

    for (const test of tests) {
        it(test.label, () => {
            expect(test.input).toEqual(test.expect);
        });
    }
});
