import { StateMachine, MetaState, MetaStateAction } from "../src";
import { PumlWriter } from "../src/puml-writer";


enum SampleState {
    Idle = 'Idle',
    Preparing = 'Preparing',
    Running = 'Running',
    Stopping = 'Closing'
}

enum SampleStateAction {
    Start = 'Start',
    CompletePreparation = 'CompletePreparation',
    Stop = 'Stop',
    CompleteStop = 'CompleteStop',
    ForceStop = 'ForceStop',
}


const sampleStateMachine: StateMachine<SampleState, SampleStateAction> = StateMachine.fromString<SampleState, SampleStateAction>(
    'SampleState',
    SampleState.Idle,
    {
        state: SampleState.Idle,
        actions: [
            [SampleStateAction.Start, SampleState.Preparing],
        ]
    },
    {
        state: SampleState.Preparing,
        actions: [
            [SampleStateAction.CompletePreparation, SampleState.Running],
            [SampleStateAction.Stop, SampleState.Stopping]
        ]
    },
    {
        state: SampleState.Running,
        actions: [
            [SampleStateAction.Stop, SampleState.Stopping]
        ]
    },
    {
        state: SampleState.Stopping,
        actions: [
            [SampleStateAction.CompleteStop, SampleState.Idle]
        ]
    },
    {
        state: MetaState.Anytime,
        actions: [
            [SampleStateAction.ForceStop, SampleState.Idle]
        ]
    }
);

console.log(sampleStateMachine.export(PumlWriter.getWriter({autoNumber: true})));


sampleStateMachine.do(MetaStateAction.DoStart); // Don't forget

if (sampleStateMachine.can(SampleStateAction.Start)) {
    sampleStateMachine.do(SampleStateAction.Start);
}

if (sampleStateMachine.current === SampleState.Preparing || sampleStateMachine.current === SampleState.Stopping) {
    // Show progress circle
}
