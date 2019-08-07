import { StateMachine, StateType, OnEnterState, OnLeaveState, StateChangedEvent } from '@working-sloth/state-machine';


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
        public readonly resource: any, // Some resource
    ) {
    }

    dispose(): void {
        this.resource.close();
    }
}


class SlothStateType implements StateType<SlothState, SlothAction>, OnEnterState, OnLeaveState {
    public static readonly Idle = new SlothStateType('Idle', 'data1');
    public static readonly Working = new SlothStateType('Working', 'data2');
    public static readonly Eating = new SlothStateType('Eating', 'data3');
    public static readonly Sleeping = new SlothStateType('Sleeping', 'data4');

    constructor(
        public readonly name: string,
        public readonly data: string
    ) {
    }

    getState(fsm: StateMachine<SlothState, SlothAction>) {
        return new SlothState(fsm, getFooBarResource(this.data));
    }

    // State Event handler
    onEnterState(event: StateChangedEvent<SlothState, SlothAction>) {
        // Hoge fuga
    }

    // State Event handler
    onLeaveState(event: StateChangedEvent<SlothState, SlothAction>) {
        event.old.dispose(); // For example, you can dispose the state
    }
}



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
    }
);

// Machine Event handler (Observable)
fsm.stateChanged.subscribe(param => {
    console.log(param.message);
    if (param.action === SlothAction.Work) {
        alert("Warning!");
    }
});

// Machine Event handler (Observable)
fsm.stateChangeFailed.subscribe(param => {
    console.error(param.message);
    if (param.action === SlothAction.Work) {
        alert("You can't work now");
    }
});

fsm.start(); // Don't forget
