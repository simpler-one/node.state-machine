import { StateMachine, MetaState, MetaStateAction } from "../src";
import { PumlWriter } from "../src/puml-writer";


enum SlothState {
    Idle = 'Idle',
    Working = 'Working',
    Eating = 'Eating',
    Sleepy = 'Sleepy',
    Sleeping = 'Sleeping'
}

enum SlothAction {
    Work = 'Work',
    Eat = 'Eat',
    Sleep = 'Sleep',
    Wake = 'Wake',
    Stop = 'Stop'
}


const sampleStateMachine: StateMachine<SlothState, SlothAction> = StateMachine.fromString<SlothState, SlothAction>(
    'SampleState',
    SlothState.Idle,
    {
        state: MetaState.Anytime,
        actions: [
            [SlothAction.Sleep, SlothState.Sleeping]
        ]
    },
    {
        state: SlothState.Idle,
        actions: [
            [SlothAction.Work, SlothState.Working],
            [SlothAction.Eat, SlothState.Eating]
        ]
    },
    {
        state: SlothState.Working,
        actions: [
            [SlothAction.Stop, SlothState.Idle]
        ]
    },
    {
        state: SlothState.Sleeping,
        actions: [
            [SlothAction.Wake, SlothState.Idle]
        ]
    },
    {
        state: SlothState.Eating,
        actions: [
            [SlothAction.Stop, SlothState.Idle]
        ]
    },
    {
        state: SlothState.Sleeping,
        actions: [
            [SlothAction.Wake, SlothState.Sleepy]
        ]
    },
    {
        state: SlothState.Sleepy,
        actions: [
            [SlothAction.Wake, SlothState.Idle]
        ]
    }
);

console.log(sampleStateMachine.export(PumlWriter.getWriter({autoNumber: true})));


sampleStateMachine.do(MetaStateAction.DoStart); // Don't forget

if (sampleStateMachine.can(SlothAction.Sleep)) {
    sampleStateMachine.do(SlothAction.Sleep);
}

if (sampleStateMachine.current === SlothState.Sleeping) {
    // PiyoPiyo
}
