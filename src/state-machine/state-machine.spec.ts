import { StateMachine } from '.'
import { MetaState, MetaStateAction } from '../state-meta'
import { StateType, OnEnterState, OnLeaveState } from '../interface';
import { buildDataMatrix } from '@working-sloth/data-matrix';
import { StateHistory } from '../state-history';
import { StateChangedEvent } from '../event-args';
import { MetaStartStateName, Statechart } from '@working-sloth/statechart-interface';

enum StringState {
    State1 = 'State1',
    State2 = 'State2',
    State3 = 'State3',
    State4 = 'State4',
}

class NamedState {
    public static readonly State1 = new NamedState('State1');
    public static readonly State2 = new NamedState('State2');
    public static readonly State3 = new NamedState('State3');

    constructor(public readonly name: string) {
    }
}

class MinimumStateType implements StateType<StringState, Action> {
    public static readonly State1 = new MinimumStateType(StringState.State1);
    public static readonly State2 = new MinimumStateType(StringState.State2);
    public static readonly State3 = new MinimumStateType(StringState.State3);

    get name(): string {
        return this.state;
    }

    constructor(public readonly state: StringState) {
    }

    getState() {
        return this.state;
    }
}

class FullStateType implements StateType<StringState, Action>, OnEnterState, OnLeaveState {
    public static readonly State1 = new FullStateType(StringState.State1);
    public static readonly State2 = new FullStateType(StringState.State2);
    public static readonly State3 = new FullStateType(StringState.State3);
    public static readonly State4 = new FullStateType(StringState.State4);

    public enterCalled: number = 0;
    public leaveCalled: number = 0;
    public lastEnter: StateChangedEvent<StringState, Action>;
    public lastLeave: StateChangedEvent<StringState, Action>;

    get name(): string {
        return this.state;
    }

    constructor(public readonly state: StringState) {
    }

    public static reset(): void {
        this.State1.reset();
        this.State2.reset();
        this.State3.reset();
        this.State4.reset();
    }


    getState() {
        return this.state;
    }

    onEnterState(event: StateChangedEvent<StringState, Action>): void {
        this.lastEnter = event;
        this.enterCalled++;
    }
    onLeaveState(event: StateChangedEvent<StringState, Action>): void {
        this.lastLeave = event;
        this.leaveCalled++;
    }

    private reset(): void {
        this.enterCalled = 0;
        this.leaveCalled = 0;
        this.lastEnter = undefined;
        this.lastLeave = undefined;
    }
}

enum Action {
    Action1 = 'Action1',
    Action2 = 'Action2',
    Action3 = 'Action3'
}

describe('StateMachine', () => {
    describe('static', () => {
        describe('fromString()', () => {
            it('should create a machine with meta start state', () => {
                // Given
                const name = 'name';

                // When
                const fsm = StateMachine.fromString<StringState, Action>(name, StringState.State1);

                // Then
                expect(fsm.name).toBe(name);
                expect(fsm.current).toBe(MetaState.Start);
            });
        });

        describe('fromNamed()', () => {
            it('should create a machine with meta start state', () => {
                // Given
                const name = 'name';

                // When
                const fsm = StateMachine.fromNamed<NamedState, Action>(name, NamedState.State1);

                // Then
                expect(fsm.name).toBe(name);
                expect(fsm.current).toBe(MetaState.Start);
            });
        });

        describe('fromType()', () => {
            it('should create a machine with meta start state', () => {
                // Given
                const name = 'name';

                // When
                const fsm = StateMachine.fromType<StringState, Action>(name, MinimumStateType.State1);

                // Then
                expect(fsm.name).toBe(name);
                expect(fsm.current).toBe(MetaState.Start);
            });
        });
    });

    describe('instance', () => {
        describe('do', () => {
            const startTests = buildDataMatrix<{type: string, fsm: StateMachine<{}, Action>, expect: {}}>([
                'type       fsm                                                                             expect',
            ], [
                ['string',  StateMachine.fromString<StringState, Action>('name', StringState.State1),       StringState.State1],
                ['named',   StateMachine.fromNamed<NamedState, Action>('name', NamedState.State1),          NamedState.State1],
                ['typed',   StateMachine.fromType<StringState, Action>('name', MinimumStateType.State1),    StringState.State1],
            ]);
            for (const test of startTests) {
                it(`should transit to user-defined start state when do start if ${test.type} state is start`, () => {
                    // Given
                    let changedEventCalled = false;
                    let failedEventCalled = false;
                    const fsm = test.fsm;
                    fsm.stateChanged.subscribe(() => { changedEventCalled = true; });
                    fsm.stateChangeFailed.subscribe(() => { failedEventCalled = true; });
        
                    // When
                    fsm.start();
        
                    // Then
                    expect(fsm.current).toBe(test.expect);
                    expect(changedEventCalled).toBe(true);
                    expect(failedEventCalled).toBe(false);
                });
            }

            it('should transit if transition is defined', () => {
                // Given
                const fsm = StateMachine.fromType<StringState, Action>('name', MinimumStateType.State1,
                {
                    state: MinimumStateType.State1,
                    transitions: [
                        [Action.Action1, MinimumStateType.State2]
                    ]
                });
                fsm.start();
    
                // When
                fsm.do(Action.Action1);
    
                // Then
                expect(fsm.current).toBe(StringState.State2);
            });

            it('should transit if child transition is defined', () => {
                // Given
                let event: StateChangedEvent<StringState, Action>;
                const fsm = StateMachine.fromType<StringState, Action>('name', FullStateType.State1,
                {
                    state: FullStateType.State1,
                    transitions: [
                        [Action.Action1, FullStateType.State3]
                    ]
                }, {
                    state: FullStateType.State2,
                    transitions: [
                    ],
                    children: [{
                        state: FullStateType.State3,
                        transitions: [
                        ],
                    }]
                });
                fsm.start();
                fsm.stateChanged.subscribe(e => event = e);
                FullStateType.reset();
    
                // When
                fsm.do(Action.Action1);
    
                // Then
                expect(fsm.current).toBe(StringState.State3);
                expect(fsm.currentStates).toEqual([StringState.State2, StringState.State3]);

                expect(event).toBeTruthy();
                expect(event.commonParents).toEqual([]);
                expect(event.oldStates).toEqual([StringState.State1]);
                expect(event.newStates).toEqual([StringState.State2, StringState.State3]);
                expect(event.forced).toEqual(false);
                expect(FullStateType.State1.leaveCalled).toBe(1);
                expect(FullStateType.State2.enterCalled).toBe(1);
                expect(FullStateType.State3.enterCalled).toBe(1);
            });

            it('should transit if parent transition is defined', () => {
                // Given
                const fsm = StateMachine.fromType<StringState, Action>('name', FullStateType.State1,
                {
                    state: FullStateType.State1,
                    transitions: [
                        [Action.Action1, FullStateType.State3]
                    ]
                }, {
                    state: FullStateType.State2,
                    transitions: [
                        [Action.Action2, FullStateType.State1]
                    ],
                    children: [{
                        state: FullStateType.State3,
                        transitions: [
                        ],
                    }]
                });
                fsm.start();
                fsm.do(Action.Action1);
    
                // When
                fsm.do(Action.Action2);
    
                // Then
                expect(fsm.current).toBe(StringState.State1);
                expect(fsm.currentStates).toEqual([StringState.State1]);
            });

            it('should transit if child to parent transition is defined', () => {
                // Given
                let event: StateChangedEvent<StringState, Action>;
                const fsm = StateMachine.fromType<StringState, Action>('name', FullStateType.State1,
                {
                    state: FullStateType.State1,
                    transitions: [
                        [Action.Action1, FullStateType.State3]
                    ]
                }, {
                    state: FullStateType.State2,
                    transitions: [
                    ],
                    children: [{
                        state: FullStateType.State3,
                        transitions: [
                            [Action.Action2, FullStateType.State2]
                        ],
                    }]
                });
                fsm.start();
                fsm.do(Action.Action1);
                FullStateType.reset();
                fsm.stateChanged.subscribe(e => event = e);
    
                // When
                fsm.do(Action.Action2);
    
                // Then
                expect(fsm.current).toBe(StringState.State2);
                expect(fsm.currentStates).toEqual([StringState.State2]);

                expect(event).toBeTruthy();
                expect(event.commonParents).toEqual([StringState.State2]);
                expect(event.oldStates).toEqual([StringState.State3]);
                expect(event.newStates).toEqual([]);
                expect(event.forced).toEqual(false);

                expect(FullStateType.State2.enterCalled).toBe(0);
                expect(FullStateType.State2.leaveCalled).toBe(0);
                expect(FullStateType.State3.leaveCalled).toBe(1);
            });

            it('should transit if parent to child transition is defined', () => {
                // Given
                let event: StateChangedEvent<StringState, Action>;
                const fsm = StateMachine.fromType<StringState, Action>('name', FullStateType.State1,
                {
                    state: FullStateType.State1,
                    transitions: [
                        [Action.Action1, FullStateType.State2]
                    ]
                }, {
                    state: FullStateType.State2,
                    transitions: [
                        [Action.Action2, FullStateType.State3]
                    ],
                    children: [{
                        state: FullStateType.State3,
                        transitions: [
                        ],
                    }]
                });
                fsm.start();
                fsm.do(Action.Action1);
                FullStateType.reset();
                fsm.stateChanged.subscribe(e => event = e);

                // When
                fsm.do(Action.Action2);

                // Then
                expect(fsm.current).toBe(StringState.State3);
                expect(fsm.currentStates).toEqual([StringState.State2, StringState.State3]);

                expect(event).toBeTruthy();
                expect(event.commonParents).toEqual([StringState.State2]);
                expect(event.oldStates).toEqual([]);
                expect(event.newStates).toEqual([StringState.State3]);

                expect(FullStateType.State2.enterCalled).toBe(0);
                expect(FullStateType.State2.leaveCalled).toBe(0);
                expect(FullStateType.State3.enterCalled).toBe(1);
            });

            it('should transit if child to child transition is defined', () => {
                // Given
                let event: StateChangedEvent<StringState, Action>;
                const fsm = StateMachine.fromType<StringState, Action>('name', FullStateType.State1,
                {
                    state: FullStateType.State1,
                    transitions: [
                        [Action.Action1, FullStateType.State3]
                    ]
                }, {
                    state: FullStateType.State2,
                    transitions: [
                    ],
                    children: [{
                        state: FullStateType.State3,
                        transitions: [
                            [Action.Action2, FullStateType.State4]
                        ],
                    }, {
                        state: FullStateType.State4,
                        transitions: [
                        ],
                    }]
                });
                fsm.start();
                fsm.do(Action.Action1);
                FullStateType.reset();
                fsm.stateChanged.subscribe(e => event = e);

                // When
                fsm.do(Action.Action2);

                // Then
                expect(fsm.current).toBe(StringState.State4);
                expect(fsm.currentStates).toEqual([StringState.State2, StringState.State4]);

                expect(event).toBeTruthy();
                expect(event.commonParents).toEqual([StringState.State2]);
                expect(event.oldStates).toEqual([StringState.State3]);
                expect(event.newStates).toEqual([StringState.State4]);

                expect(FullStateType.State2.enterCalled).toBe(0);
                expect(FullStateType.State2.leaveCalled).toBe(0);
                expect(FullStateType.State3.leaveCalled).toBe(1);
                expect(FullStateType.State4.enterCalled).toBe(1);
            });

            it('should NOT transit to next state when do action if transition is NOT defined', () => {
                // Given
                let changedEventCalled = false;
                let failedEventCalled = false;
                const fsm = StateMachine.fromType<StringState, Action>('name', MinimumStateType.State1,
                {
                    state: MinimumStateType.State1,
                    transitions: [
                    ]
                });
                fsm.start();
                fsm.stateChanged.subscribe(() => { changedEventCalled = true; });
                fsm.stateChangeFailed.subscribe(() => { failedEventCalled = true; });
    
                // When
                fsm.do(Action.Action1);
    
                // Then
                expect(fsm.current).toBe(StringState.State1);
                expect(changedEventCalled).toBe(false);
                expect(failedEventCalled).toBe(true);
            });

            it('should transit to next state when do action if anytime transition is defined', () => {
                // Given
                const fsm = StateMachine.fromType<StringState, Action>('name', MinimumStateType.State1,
                {
                    state: MetaState.Anytime,
                    transitions: [
                        [Action.Action1, MinimumStateType.State2]
                    ]
                }, {
                    state: MinimumStateType.State1,
                    transitions: [
                    ]
                });
                fsm.start();
    
                // When
                fsm.do(Action.Action1);
    
                // Then
                expect(fsm.current).toBe(StringState.State2);
            });

            it('should call enter/leave event when do action if event handler is defined', () => {
                // Given
                const fsm = StateMachine.fromType<StringState, Action>('name', FullStateType.State1,
                {
                    state: MetaState.Anytime,
                    transitions: [
                        [Action.Action1, FullStateType.State2]
                    ]
                },
                {
                    state: FullStateType.State1,
                    transitions: [
                    ]
                });
                fsm.start();
                FullStateType.reset();

                // When
                fsm.do(Action.Action1);
    
                // Then
                expect(fsm.current).toBe(StringState.State2);
                expect(FullStateType.State1.enterCalled).toBe(0);
                expect(FullStateType.State1.leaveCalled).toBe(1);
                expect(FullStateType.State2.enterCalled).toBe(1);
                expect(FullStateType.State2.leaveCalled).toBe(0);
            });
        });

        describe('forceSet', () => {
            it(`should throw if state is NOT defined`, () => {
                // Given
                const fsm = StateMachine.fromString('name', StringState.State1);
                let err = false;

                // When
                try {
                    fsm.forceSet(StringState.State2, '');
                } catch (e) {
                    err = true;
                }
    
                // Then
                expect(err).toBe(true);
            });
        });

        describe('forceIfFail', () => {
            it(`should transit normally if transition is defined`, () => {
                // Given
                const fsm = StateMachine.fromString('name', StringState.State1,
                {
                    state: StringState.State1,
                    transitions: [
                        [Action.Action1, StringState.State2]
                    ]
                });
    
                // When
                fsm.start();
                const result = fsm.forceIfFail(Action.Action1, StringState.State2);
    
                // Then
                expect(fsm.current).toBe(StringState.State2);
                expect(result).toBe(true);
            });

            it(`should transit forcibly if transition is NOT defined`, () => {
                // Given
                const fsm = StateMachine.fromNamed('name', NamedState.State1,
                {
                    state: NamedState.State1,
                    transitions: [
                    ]
                },
                {
                    state: NamedState.State2,
                    transitions: [
                    ]
                });
    
                // When
                fsm.start();
                const result = fsm.forceIfFail(Action.Action1, NamedState.State2);
    
                // Then
                expect(fsm.current).toBe(NamedState.State2);
                expect(result).toBe(false);
            });
        });

        describe('require', () => {
            it(`should transit normally if transition is defined and state is expected`, () => {
                // Given
                const fsm = StateMachine.fromString('name', StringState.State1,
                {
                    state: StringState.State1,
                    transitions: [
                        [Action.Action1, StringState.State2]
                    ]
                });
    
                // When
                fsm.start();
                const result = fsm.require(Action.Action1, StringState.State2);
    
                // Then
                expect(fsm.current).toBe(StringState.State2);
                expect(result).toBe(true);
            });

            it(`should transit forcibly if transition is NOT defined`, () => {
                // Given
                const fsm = StateMachine.fromNamed('name', NamedState.State1,
                {
                    state: NamedState.State1,
                    transitions: [
                    ]
                },
                {
                    state: NamedState.State2,
                    transitions: [
                    ]
                });
    
                // When
                fsm.start();
                const result = fsm.require(Action.Action1, NamedState.State2);
    
                // Then
                expect(fsm.current).toBe(NamedState.State2);
                expect(result).toBe(false);
            });

            it(`should transit forcibly if transition is defined and state is NOT expected`, () => {
                // Given
                const fsm = StateMachine.fromNamed('name', NamedState.State1,
                {
                    state: NamedState.State1,
                    transitions: [
                        [Action.Action1, NamedState.State3]
                    ]
                },
                {
                    state: NamedState.State2,
                    transitions: [
                    ]
                });
    
                // When
                fsm.start();
                const result = fsm.require(Action.Action1, NamedState.State2);
    
                // Then
                expect(fsm.current).toBe(NamedState.State2);
                expect(result).toBe(false);
            });
        });

        describe('reset', () => {
            it('should become meta start state when reset', () => {
                // Given
                const fsm = StateMachine.fromString<StringState, Action>('name', StringState.State1);
                fsm.start();
    
                // When
                fsm.reset();
    
                // Then
                expect(fsm.current).toBe(MetaState.Start);
            });

            it('should called "onLeave" event callback when reset if callback is defined', () => {
                // Given
                const fsm = StateMachine.fromType<StringState, Action>('name', FullStateType.State1);
                fsm.start();
                const enterCalled = FullStateType.State1.enterCalled;
                const leaveCalled = FullStateType.State1.leaveCalled;

                // When
                fsm.reset();
    
                // Then
                expect(fsm.current).toBe(MetaState.Start);
                expect(FullStateType.State1.enterCalled).toBe(enterCalled);
                expect(FullStateType.State1.leaveCalled).toBe(leaveCalled + 1);
            });
        });

        describe('restart', () => {
            it('should become user-defined start state when restart if current is NOT user-defined start', () => {
                // Given
                const fsm = StateMachine.fromString<StringState, Action>('name', StringState.State1);
                fsm.start();
    
                // When
                fsm.restart();
    
                // Then
                expect(fsm.current).toBe(StringState.State1);
            });

            it('should become user-defined start state when restart', () => {
                // Given
                const fsm = StateMachine.fromString<StringState, Action>('name', StringState.State1);
                // When
                fsm.restart();
                // Then
                expect(fsm.current).toBe(StringState.State1);
            });
        });

        describe('can', () => {
            it('should return true when try to do start if state is start', () => {
                // Given
                const fsm = StateMachine.fromType<StringState, Action>('name', MinimumStateType.State1);
    
                // When
                const result = fsm.can(MetaStateAction.DoStart);
    
                // Then
                expect(result).toBe(true);
            });

            it('should return true when try to do action if transition is defined', () => {
                // Given
                const fsm = StateMachine.fromType<StringState, Action>('name', MinimumStateType.State1,
                {
                    state: MinimumStateType.State1,
                    transitions: [
                        [Action.Action1, MinimumStateType.State2]
                    ]
                });
                fsm.start();
    
                // When
                const result = fsm.can(Action.Action1);
    
                // Then
                expect(result).toBe(true);
            });

            it('should return false when try to do action if transition is NOT defined', () => {
                // Given
                const fsm = StateMachine.fromType<StringState, Action>('name', MinimumStateType.State1,
                {
                    state: MinimumStateType.State1,
                    transitions: [
                    ]
                });
                fsm.start();
    
                // When
                const result = fsm.can(Action.Action1);
    
                // Then
                expect(result).toBe(false);
            });

            it('should return true when try to do action if anytime transition is defined', () => {
                // Given
                const fsm = StateMachine.fromType<StringState, Action>('name', MinimumStateType.State1,
                {
                    state: MetaState.Anytime,
                    transitions: [
                        [Action.Action1, MinimumStateType.State2]
                    ]
                },
                {
                    state: MinimumStateType.State1,
                    transitions: [
                    ]
                });
                fsm.start();
    
                // When
                const result = fsm.can(Action.Action1);
    
                // Then
                expect(result).toBe(true);
            });
        });

        describe('currentIs', () => {
            const fsm = StateMachine.fromNamed('name', NamedState.State1);
            fsm.start();

            it('(by string)', () => {
                expect(fsm.currentIs(StringState.State1));
            });

            it('(by state)', () => {
                expect(fsm.currentIs(NamedState.State1));
            });
        });

        describe('toChart', () => {
            it('should return only meta start map if state is empty', () => {
                // Given
                const name = 'name';
                const fsm = StateMachine.fromString<StringState, Action>(name, StringState.State1);

                // When
                const result = fsm.toChart();

                // Then
                expect(result).toEqual({
                    name,
                    states: [{
                        name: MetaStartStateName,
                        transitions: [{
                            action: MetaStateAction.DoStart,
                            destination: StringState.State1
                        }],
                        children: [],
                    }, {
                        name: StringState.State1,
                        transitions: [],
                        children: [],
                    }]
                });
            });

            it('should return user-defined map if some states are defined (without children)', () => {
                // Given
                const name = 'name';
                const fsm = StateMachine.fromString<StringState, Action>(
                    name,
                    StringState.State1,
                    {
                        state: StringState.State1,
                        transitions: [
                            [Action.Action1, StringState.State2]
                        ]
                    }
                );

                // When
                const result = fsm.toChart();

                // Then
                expect(result).toEqual({
                    name,
                    states: [{
                        name: StringState.State1,
                        transitions: [{
                            action: Action.Action1,
                            destination: StringState.State2
                        }],
                        children: [],
                    }, {
                        name: StringState.State2,
                        transitions: [],
                        children: [],
                    }, {
                        name: MetaStartStateName,
                        transitions: [{
                            action: MetaStateAction.DoStart,
                            destination: StringState.State1
                        }],
                        children: [],
                    }]
                });
            });

            it('should return user-defined map if some states are defined (with children)', () => {
                // Given
                const name = 'name';
                const fsm = StateMachine.fromString<StringState, Action>(
                    name,
                    StringState.State1,
                    {
                        state: StringState.State1,
                        transitions: [
                            [Action.Action1, StringState.State2]
                        ],
                        children: [{
                            state: StringState.State2,
                            transitions: []
                        }]
                    }
                );

                // When
                const result = fsm.toChart();

                // Then
                expect(result).toEqual({
                    name,
                    states: [{
                        name: StringState.State1,
                        transitions: [{
                            action: Action.Action1,
                            destination: StringState.State2
                        }],
                        children: [{
                            name: StringState.State2,
                            transitions: [],
                            children: [],
                        }],
                    }, {
                        name: MetaStartStateName,
                        transitions: [{
                            action: MetaStateAction.DoStart,
                            destination: StringState.State1
                        }],
                        children: [],
                    }]
                });
            });

            it('should return user-defined map if some states are defined (with start children)', () => {
                // Given
                const name = 'name';
                const fsm = StateMachine.fromString<StringState, Action>(
                    name,
                    StringState.State1,
                    {
                        state: StringState.State1,
                        transitions: [
                            [Action.Action1, StringState.State2]
                        ],
                        children: [{
                            state: StringState.State2,
                            transitions: []
                        }],
                        startChild: StringState.State2,
                    }
                );

                // When
                const result = fsm.toChart();

                // Then
                expect(result).toEqual({
                    name,
                    states: [{
                        name: StringState.State1,
                        transitions: [{
                            action: Action.Action1,
                            destination: StringState.State2
                        }],
                        children: [{
                            name: MetaStartStateName,
                            transitions: [{
                                action: MetaStateAction.DoStart,
                                destination: StringState.State2,
                            }],
                            children: [],
                        }, {
                            name: StringState.State2,
                            transitions: [],
                            children: [],
                        }],
                    }, {
                        name: MetaStartStateName,
                        transitions: [{
                            action: MetaStateAction.DoStart,
                            destination: StringState.State1
                        }],
                        children: [],
                    }]
                });
            });

            it('should return same map each other', () => {
                // Given
                const name = 'name';
                const stringFsm = StateMachine.fromString<StringState, Action>(
                    name,
                    StringState.State1,
                    {
                        state: MetaState.Anytime,
                        transitions: [
                            [Action.Action3, StringState.State1]
                        ]
                    },
                    {
                        state: StringState.State1,
                        transitions: [
                            [Action.Action1, StringState.State2]
                        ]
                    },
                    {
                        state: StringState.State2,
                        transitions: [
                            [Action.Action2, StringState.State3]
                        ]
                    },
                    {
                        state: StringState.State3,
                        transitions: [
                            [Action.Action1, StringState.State2],
                            [Action.Action3, StringState.State1]
                        ]
                    }
                );
                const namedFsm = StateMachine.fromNamed<NamedState, Action>(
                    name,
                    NamedState.State1,
                    {
                        state: MetaState.Anytime,
                        transitions: [
                            [Action.Action3, NamedState.State1]
                        ]
                    },
                    {
                        state: NamedState.State1,
                        transitions: [
                            [Action.Action1, NamedState.State2]
                        ]
                    },
                    {
                        state: NamedState.State2,
                        transitions: [
                            [Action.Action2, NamedState.State3]
                        ]
                    },
                    {
                        state: NamedState.State3,
                        transitions: [
                            [Action.Action1, NamedState.State2],
                            [Action.Action3, NamedState.State1]
                        ]
                    }
                );
                const typedFsm = StateMachine.fromType<StringState, Action>(
                    name,
                    MinimumStateType.State1,
                    {
                        state: MetaState.Anytime,
                        transitions: [
                            [Action.Action3, MinimumStateType.State1]
                        ]
                    },
                    {
                        state: MinimumStateType.State1,
                        transitions: [
                            [Action.Action1, MinimumStateType.State2]
                        ]
                    },
                    {
                        state: MinimumStateType.State2,
                        transitions: [
                            [Action.Action2, MinimumStateType.State3]
                        ]
                    },
                    {
                        state: MinimumStateType.State3,
                        transitions: [
                            [Action.Action1, MinimumStateType.State2],
                            [Action.Action3, MinimumStateType.State1]
                        ]
                    }
                );

                // When
                const stringResult = stringFsm.toChart();
                const namedResult = namedFsm.toChart();
                const typedResult = typedFsm.toChart();

                // Then
                expect(stringResult).toEqual(namedResult);
                expect(stringResult).toEqual(typedResult);
                expect(namedResult).toEqual(typedResult);
            });
        });

        describe('export', () => {
            it('should give equal map to toChart', () => {
                // Given
                const name = 'name';
                const fsm = StateMachine.fromString<StringState, Action>(
                    name,
                    StringState.State1,
                    {
                        state: StringState.State1,
                        transitions: [
                            [Action.Action1, StringState.State2]
                        ]
                    }
                );
                const result = 'result';
                let actualMap: Statechart;
                const writer = (map: Statechart) => {
                    actualMap = map;
                    return result;
                };

                // When
                const actualResult = fsm.export(writer);

                // Then
                expect(actualResult).toBe(result);
                expect(actualMap).toEqual(fsm.toChart());
            });
        });

        it('current', () => {
            // Given
            const fsm = StateMachine.fromString('name', StringState.State1);
            fsm.start();
            // When
            const result = fsm.current;
            // Then
            expect(result).toBe(StringState.State1);
        });

        it('currentRoot', () => {
            // Given
            const fsm = StateMachine.fromString('name', StringState.State1);
            fsm.start();
            // When
            const result = fsm.currentRoot;
            // Then
            expect(result).toBe(StringState.State1);
        });

        describe('historyCapacity', () => {
            it('should set normally if not negative value was set', () => {
                // Given
                const capacity = 10;
                const fsm = StateMachine.fromString('name', StringState.State1);

                // When
                fsm.historyCapacity = capacity;

                // Then
                expect(fsm.historyCapacity).toBe(capacity);
            });

            it('should set zero if negative value was set', () => {
                // Given
                const capacity = -1;
                const fsm = StateMachine.fromString('name', StringState.State1);

                // When
                fsm.historyCapacity = capacity;

                // Then
                expect(fsm.historyCapacity).toBe(0);
            });
        });

        describe('histories', () => {
            it('should return histories', () => {
                // Given
                const fsm = StateMachine.fromString<StringState, Action>('name', StringState.State1,
                {
                    state: StringState.State1,
                    transitions: [
                        [Action.Action1, StringState.State2]
                    ]
                }, {
                    state: StringState.State2,
                    transitions: [
                        [Action.Action2, StringState.State1]
                    ]
                });
    
                // When
                fsm.start();
                fsm.do(Action.Action1);
                fsm.do(Action.Action2);
                fsm.do(Action.Action2);
                const histories = fsm.histories;

                // Then
                const expected = [
                    new StateHistory(undefined, [], [MetaStartStateName], [StringState.State1], MetaStateAction.DoStart, false),
                    new StateHistory(undefined, [], [StringState.State1], [StringState.State2], Action.Action1, false),
                    new StateHistory(undefined, [], [StringState.State2], [StringState.State1], Action.Action2, false),
                    new StateHistory(undefined, [], [StringState.State1], undefined, Action.Action2, false),
                ];
                expect(histories.length).toBe(expected.length);
                for (let i = 0; i < expected.length; i++) {
                    expect(histories[i].oldState).toEqual(expected[i].oldState);
                    expect(histories[i].newState).toEqual(expected[i].newState);
                    expect(histories[i].action).toBe(expected[i].action);
                }
            });

            it('should return limited size histories if history is overflow', () => {
                // Given
                const fsm = StateMachine.fromString<StringState, Action>('name', StringState.State1,
                {
                    state: StringState.State1,
                    transitions: [
                        [Action.Action1, StringState.State2]
                    ]
                }, {
                    state: StringState.State2,
                    transitions: [
                        [Action.Action2, StringState.State1]
                    ]
                });
                fsm.historyCapacity = 2;
    
                // When
                fsm.start();
                fsm.do(Action.Action1);
                fsm.do(Action.Action2);
                fsm.do(Action.Action1);
                const histories = fsm.histories;

                // Then
                expect(histories.length).toEqual(fsm.historyCapacity);
            });

            it('should return limited size histories if history capacity is reduced', () => {
                // Given
                const fsm = StateMachine.fromString<StringState, Action>('name', StringState.State1,
                {
                    state: StringState.State1,
                    transitions: [
                        [Action.Action1, StringState.State2]
                    ]
                }, {
                    state: StringState.State2,
                    transitions: [
                        [Action.Action2, StringState.State1]
                    ]
                });
                fsm.start();
                fsm.do(Action.Action1);
                fsm.do(Action.Action2);
                fsm.do(Action.Action1);

                // When
                fsm.historyCapacity = 2;
                const histories = fsm.histories;

                // Then
                expect(histories.length).toEqual(fsm.historyCapacity);
            });
        });
    });
});
