import { StateMachine, StateType, OnEnterState, OnLeaveState, StateChangedEvent } from '@working-sloth/state-machine';

type SlothParams = { sleepiness: number, sleepingTime: string };


enum SlothAction {
    Work = 'Work',
    Eat = 'Eat',
    Sleep = 'Sleep',
    Wake = 'Wake',
    Stop = 'Stop'
}

class SlothState {


    constructor(
        private readonly fsm: StateMachine<SlothState, SlothAction>,
        public readonly resource: any,
    ) {
    }

    dispose(params: SlothParams): void {
        this.resource.close();
    }
}

class SlothStateType implements StateType<SlothState, SlothAction, SlothParams>, OnEnterState, OnLeaveState {
    public static readonly Idle = new SlothStateType('Idle', 'data1');
    public static readonly Working = new SlothStateType('Working', 'data2');
    public static readonly Eating = new SlothStateType('Eating', 'data3');
    public static readonly Sleeping = new SlothStateType('Sleeping', 'data4');

    constructor(
        public readonly name: string,
        public readonly data: string
    ) {
    }

    // You can receive optional params
    getState(fsm: StateMachine<SlothState, SlothAction>, params: SlothParams) {
        return new SlothState(fsm, getFooBarResource(this.data, params.sleepiness, params.sleepingTime));
    }

    // You can receive optional params
    onEnterState(event: StateChangedEvent<SlothState, SlothAction, SlothParams>) {
        // Hoge fuga
    }

    // You can receive optional params
    onLeaveState(event: StateChangedEvent<SlothState, SlothAction, SlothParams>) {
        event.old.dispose(event.params); // For example, you can dispose the state
    }
}



const fsm = StateMachine.fromType<SlothState, SlothAction, SlothParams>(
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
    }
);

let p: SlothParams = undefined;

// You can start with optional params
fsm.start(p); // Don't forget

// You can do with optional params
fsm.do(SlothAction.Sleep, p);
