import { StateMachine, NamedState } from '@working-sloth/state-machine';


class SlothState implements NamedState<SlothState, SlothAction> {
    public static readonly Idle = new SlothState('Idle', 0, 0);
    public static readonly Working = new SlothState('Working', 1, 2);
    public static readonly Eating = new SlothState('Eating', 3, 4);
    public static readonly Sleeping = new SlothState('Sleeping', 5, 6);

    public value1: number;
    public value2: number;

    constructor(
        public readonly name: string,
        private readonly initialValue1: number,
        private readonly initialValue2: number
    ) {
    }

    // State Event handler
    onEnterState(oldState: SlothState, newState: SlothState, action: SlothAction) {
        // Hoge fuga
    }

    // State Event handler
    onLeaveState(oldState: SlothState, newState: SlothState, action: SlothAction) {
        this.reset(); // For example, you can reset the state
    }

    private reset(): void {
        this.value1 = this.initialValue1;
        this.value2 = this.initialValue2;
    }
}

enum SlothAction {
    Work = 'Work',
    Eat = 'Eat',
    Sleep = 'Sleep',
    Wake = 'Wake',
    Stop = 'Stop'
}


const fsm = StateMachine.fromNamed<SlothState, SlothAction>(
    'SlothState',
    SlothState.Idle,
    {
        state: SlothState.Idle,
        actions: [
            [SlothAction.Sleep, SlothState.Sleeping],
            [SlothAction.Work, SlothState.Working],
            [SlothAction.Eat, SlothState.Eating]
        ]
    },
    {
        state: SlothState.Working,
        actions: [
            [SlothAction.Sleep, SlothState.Sleeping],
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
            [SlothAction.Sleep, SlothState.Sleeping],
            [SlothAction.Stop, SlothState.Idle]
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
fsm.stateCstateChangeFailed.subscribe(param => {
    console.error(param.message);
    if (param.action === SlothAction.Work) {
        alert("You can't work now");
    }
});

fsm.start(); // Don't forget
