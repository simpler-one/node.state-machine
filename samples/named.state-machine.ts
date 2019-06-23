import { StateMachine, MetaState, MetaStateAction } from "../src";
import { PumlWriter } from "../src/puml-writer";


class SlothState {
    public static readonly Idle = new SlothState('Idle', -0.1, 0.1);
    public static readonly Working = new SlothState('Working', -1, 100);
    public static readonly Eating = new SlothState('Eating', 10, 2);
    public static readonly Sleepy = new SlothState('Sleepy', 0.05, 0);
    public static readonly Sleeping = new SlothState('Sleeping', -0.01, -10);

    public readonly start: Date;

    constructor(
        public readonly name: string,
        public readonly energyIncrease: number,
        public readonly sleepinessIncrease: number
    ) {
        this.start = new Date();
    }
}


enum SlothAction {
    Work = 'Work',
    Eat = 'Eat',
    Sleep = 'Sleep',
    Wake = 'Wake',
    Stop = 'Stop'
}


const slothStateMachine: StateMachine<SlothState, SlothAction> = StateMachine.fromNamed<SlothState, SlothAction>(
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
        state: SlothState.Sleepy,
        actions: [
            [SlothAction.Wake, SlothState.Idle]
        ]
    },
    {
        state: SlothState.Sleeping,
        actions: [
            [SlothAction.Wake, SlothState.Sleepy]
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

let energy = 10;
energy += slothStateMachine.current.energyIncrease;
