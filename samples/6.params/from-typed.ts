import { StateMachine, StateType } from '@working-sloth/state-machine';

type SlothParams = { sleepiness: number, sleepingTime: string };

class SlothState {

    public readonly resource: any;

    dispose(params: SlothParams): void {
        this.resource.close();
    }
}

enum SlothAction {
    Work = 'Work',
    Eat = 'Eat',
    Sleep = 'Sleep',
    Wake = 'Wake',
    Stop = 'Stop'
}

class SlothStateType implements StateType<SlothState, SlothAction, SlothParams> {
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
    getState(params: SlothParams) {
        return new SlothState(getFooBarResource(this.data, params.sleepiness, params.sleepingTime));
    }

    // You can receive optional params
    onEnterState(oldState: SlothState, newState: SlothState, action: SlothAction, params: SlothParams) {
        // Hoge fuga
    }

    // You can receive optional params
    onLeaveState(oldState: SlothState, newState: SlothState, action: SlothAction, params: SlothParams) {
        oldState.dispose(params); // For example, you can dispose the state
    }
}



const fsm = StateMachine.fromType<SlothState, SlothAction, SlothParams>(
    'SlothState',
    SlothStateType.Idle,
    {
        state: SlothStateType.Idle,
        actions: [
            [SlothAction.Sleep, SlothStateType.Sleeping],
            [SlothAction.Work, SlothStateType.Working],
            [SlothAction.Eat, SlothStateType.Eating]
        ]
    },
    {
        state: SlothStateType.Working,
        actions: [
            [SlothAction.Sleep, SlothStateType.Sleeping],
            [SlothAction.Stop, SlothStateType.Idle]
        ]
    },
    {
        state: SlothStateType.Sleeping,
        actions: [
            [SlothAction.Wake, SlothStateType.Idle]
        ]
    },
    {
        state: SlothStateType.Eating,
        actions: [
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
