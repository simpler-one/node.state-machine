import { StateMachine, MetaState, MetaStateAction } from "../src";
import { PumlWriter } from "../src/puml-writer";


class SampleState {
    public static readonly Idle = new SampleState('Idle', 'Start', true);
    public static readonly Preparing = new SampleState('Preparing', 'Please wait...', false);
    public static readonly Running = new SampleState('Running', 'Hello world!', true);
    public static readonly Stopping = new SampleState('Stopping', 'Closing...', false);

    constructor(
        public readonly name: string,
        public readonly label: string,
        public readonly buttonEnabled: boolean
    ) {
    }

    mainTask(): void {
        // Foo bar
    }
}

enum SampleStateAction {
    Start = 'Start',
    CompletePreparation = 'CompletePreparation',
    Stop = 'Stop',
    CompleteStop = 'CompleteStop',
    ForceStop = 'ForceStop',
}


const sampleStateMachine: StateMachine<SampleState, SampleStateAction> = StateMachine.fromNamed<SampleState, SampleStateAction>(
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

console.log(`Label: ${sampleStateMachine.current.label}`);

if (!sampleStateMachine.current.buttonEnabled) {
    // Disable button
}
