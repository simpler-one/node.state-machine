import { StateMachine, MetaState } from '@working-sloth/state-machine';


enum SlothState {
    Idle = 'Idle',
    Working = 'Working',
    Eating = 'Eating',
    Sleeping = 'Sleeping'
}

enum SlothAction {
    Work = 'Work',
    Eat = 'Eat',
    Sleep = 'Sleep',
    Wake = 'Wake',
    Stop = 'Stop'
}


const fsm = StateMachine.fromString<SlothState, SlothAction>(
    'SlothState',
    SlothState.Idle,
    {
        state: MetaState.Anytime, // import MetaState before declaration
        actions: [
            // You can allow all states always to do something such as reset
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
    }
);


fsm.start(); // Don't forget

if (fsm.can(SlothAction.Sleep)) {
    fsm.do(SlothAction.Sleep);
}

if (fsm.current === SlothState.Sleeping) {
    // PiyoPiyo
}
