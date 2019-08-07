import { StateMachine, NamedState } from '@working-sloth/state-machine';

enum SlothAction {
    Work = 'Work',
    Eat = 'Eat',
    Sleep = 'Sleep',
    Wake = 'Wake',
    Stop = 'Stop'
}

// You can use any class as state if only it has name
class SlothState implements NamedState<SlothState, SlothAction> {
    public static readonly Idle = new SlothState('Idle', -0.1, 0.1);
    public static readonly Working = new SlothState('Working', -1, 100);
    public static readonly Eating = new SlothState('Eating', 10, 2);
    public static readonly Sleeping = new SlothState('Sleeping', -0.01, -10);

    constructor(
        public readonly name: string, // name property is mandatory
        public readonly energyIncrease: number,
        public readonly sleepinessIncrease: number
    ) {
    }
}


const fsm = StateMachine.fromNamed<SlothState, SlothAction>(
    'SlothState',
    SlothState.Idle,
    {
        state: SlothState.Idle,
        transitions: [
            [SlothAction.Sleep, SlothState.Sleeping],
            [SlothAction.Work, SlothState.Working],
            [SlothAction.Eat, SlothState.Eating]
        ]
    },
    {
        state: SlothState.Working,
        transitions: [
            [SlothAction.Sleep, SlothState.Sleeping],
            [SlothAction.Stop, SlothState.Idle]
        ]
    },
    {
        state: SlothState.Sleeping,
        transitions: [
            [SlothAction.Wake, SlothState.Idle]
        ]
    },
    {
        state: SlothState.Eating,
        transitions: [
            [SlothAction.Sleep, SlothState.Sleeping],
            [SlothAction.Stop, SlothState.Idle]
        ]
    }
);


fsm.start(); // Don't forget

if (fsm.can(SlothAction.Sleep)) {
    fsm.do(SlothAction.Sleep);
}


let energy = 10;
// You can access any state's members you defined
energy += fsm.current.energyIncrease;
