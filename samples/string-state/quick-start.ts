import { StateMachine } from '@working-sloth/state-machine';

enum SlothState {
    Idle = 'Idle',
    Eating = 'Eating',
    Sleeping = 'Sleeping'
}

enum SlothAction {
    Eat = 'Eat',
    Sleep = 'Sleep',
    Wake = 'Wake',
    Stop = 'Stop'
}

const fsm = StateMachine.fromString<SlothState, SlothAction>(
    'Sloth State', // state machine name
    SlothState.Idle, // start state
    {
        state: SlothState.Idle,
        actions: [
            [SlothAction.Sleep, SlothState.Sleeping],
            [SlothAction.Eat, SlothState.Eating],
        ]
    }, {
        state: SlothState.Sleeping,
        actions: [
            [SlothAction.Wake, SlothState.Idle],
        ]
    }, {
        state: SlothState.Eating,
        actions: [
            [SlothAction.Sleep, SlothState.Sleeping],
            [SlothAction.Stop, SlothState.Idle],
        ]
    }
);

if (fsm.can(SlothAction.Sleep)) {
    fsm.do(SlothAction.Sleep);
}
