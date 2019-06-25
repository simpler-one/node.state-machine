import { StateMachine, MetaState, MetaStateAction, PumlWriter } from "@working-sloth/state-machine";


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


const slothStateMachine: StateMachine<SlothState, SlothAction> = StateMachine.fromString<SlothState, SlothAction>(
    'SlothState',
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

console.log(slothStateMachine.export(PumlWriter.getWriter({autoNumber: true})));


slothStateMachine.do(MetaStateAction.DoStart); // Don't forget

if (slothStateMachine.can(SlothAction.Sleep)) {
    slothStateMachine.do(SlothAction.Sleep);
}

if (slothStateMachine.current === SlothState.Sleeping) {
    // PiyoPiyo
}
