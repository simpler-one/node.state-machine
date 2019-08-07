import { StateMachine, StateType } from '@working-sloth/state-machine';


enum SlothAction {
    Work = 'Work',
    Eat = 'Eat',
    Sleep = 'Sleep',
    Wake = 'Wake',
    Stop = 'Stop'
}

// Create state class first
class SlothState {

    // You can let it having fluid members easily
    public readonly start: Date;
    public count: number;

    constructor(
        private readonly fsm: StateMachine<SlothState, SlothAction>,
        public readonly energyIncrease: number,
        public readonly sleepinessIncrease: number
    ) {
        this.start = new Date();
    }

    mainTask(): void {
        // Foo bar
        this.fsm.do(SlothAction.Sleep); // Transit
    }

    countUp(): void {
        this.count++;
    }
}

// Create state type class second
class SlothStateType implements StateType<SlothState, SlothAction> {
    public static readonly Idle = new SlothStateType('Idle', -0.1, 0.1);
    public static readonly Working = new SlothStateType('Working', -1, 100);
    public static readonly Eating = new SlothStateType('Eating', 10, 2);
    public static readonly Sleeping = new SlothStateType('Sleeping', -0.01, -10);

    constructor(
        public readonly name: string,
        public readonly energyIncrease: number,
        public readonly sleepinessIncrease: number
    ) {
    }

    // Create state
    getState(fsm: StateMachine<SlothState, SlothAction>) {
        return new SlothState(fsm, this.energyIncrease, this.sleepinessIncrease);
    }
}


// S(Generic type) is a State, not a StateType!
const fsm = StateMachine.fromType<SlothState, SlothAction>(
    'SlothState',
    SlothStateType.Idle,
    {
        state: SlothStateType.Idle,
        transitions: [
            [SlothAction.Sleep, SlothStateType.Sleeping],
            [SlothAction.Work, SlothStateType.Working],
            [SlothAction.Eat, SlothStateType.Eating]
        ]
    },
    {
        state: SlothStateType.Working,
        transitions: [
            [SlothAction.Sleep, SlothStateType.Sleeping],
            [SlothAction.Stop, SlothStateType.Idle]
        ]
    },
    {
        state: SlothStateType.Sleeping,
        transitions: [
            [SlothAction.Wake, SlothStateType.Idle]
        ]
    },
    {
        state: SlothStateType.Eating,
        transitions: [
            [SlothAction.Sleep, SlothStateType.Sleeping],
            [SlothAction.Stop, SlothStateType.Idle]
        ]
    },
);


fsm.start(); // Don't forget

console.log(fsm.current.start);

fsm.current.countUp();
fsm.current.mainTask();
