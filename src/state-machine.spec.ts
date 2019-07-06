
import { StateMachine } from './state-machine'
import { MetaState, MetaStateAction } from './state-meta'
import { StateMachineMap } from './interface';
import { buildDataMatrix } from '@working-sloth/data-matrix';
import { StateHistory } from './state-history';

enum StringState {
    State1 = 'State1',
    State2 = 'State2',
    State3 = 'State3'
}

class NamedState {
    public static readonly State1 = new NamedState('State1');
    public static readonly State2 = new NamedState('State2');
    public static readonly State3 = new NamedState('State3');

    constructor(public readonly name: string) {
    }
}

class TypedState {
    public static readonly State1 = new TypedState(StringState.State1);
    public static readonly State2 = new TypedState(StringState.State2);
    public static readonly State3 = new TypedState(StringState.State3);

    get name(): string {
        return this.state;
    }

    constructor(public readonly state: StringState) {
    }

    getState() {
        return this.state;
    }
}

class FullTypedState {
    public static readonly State1 = new FullTypedState(StringState.State1);
    public static readonly State2 = new FullTypedState(StringState.State2);
    public static readonly State3 = new FullTypedState(StringState.State3);

    public enterCalled: number = 0;
    public leaveCalled: number = 0;

    get name(): string {
        return this.state;
    }

    constructor(public readonly state: StringState) {
    }

    getState() {
        return this.state;
    }

    onEnterState(): void {
        this.enterCalled++;
    }
    onLeaveState(): void {
        this.leaveCalled++;
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
                const fsm = StateMachine.fromType<StringState, Action>(name, TypedState.State1);

                // Then
                expect(fsm.name).toBe(name);
                expect(fsm.current).toBe(MetaState.Start);
            });
        });
    });

    describe('instance', () => {
        describe('do', () => {
            const startTests = buildDataMatrix<{type: string, fsm: StateMachine<{}, Action>, expect: {}}>([
                'type       fsm                                                                         expect',
            ], [
                ['string',  StateMachine.fromString<StringState, Action>('name', StringState.State1),   StringState.State1],
                ['named',   StateMachine.fromNamed<NamedState, Action>('name', NamedState.State1),      NamedState.State1],
                ['typed',   StateMachine.fromType<StringState, Action>('name', TypedState.State1),      StringState.State1],
            ]);
            for (const test of startTests) {
                it(`should transit to user-defined start state when do start if ${test.type} state is start`, () => {
                    // Given
                    let changedEventCalled = false;
                    let failedEventCalled = false;
                    const fsm = test.fsm;
                    fsm.stateChanged.subscribe(() => { changedEventCalled = true; });
                    fsm.stateCstateChangeFailed.subscribe(() => { failedEventCalled = true; });
        
                    // When
                    fsm.start();
        
                    // Then
                    expect(fsm.current).toBe(test.expect);
                    expect(changedEventCalled).toBe(true);
                    expect(failedEventCalled).toBe(false);
                });
            }

            it('should transit to next state when do action if transition is defined', () => {
                // Given
                const fsm = StateMachine.fromType<StringState, Action>('name', TypedState.State1,
                {
                    state: TypedState.State1,
                    actions: [
                        [Action.Action1, TypedState.State2]
                    ]
                });
                fsm.start();
    
                // When
                fsm.do(Action.Action1);
    
                // Then
                expect(fsm.current).toBe(StringState.State2);
            });

            it('should NOT transit to next state when do action if transition is NOT defined', () => {
                // Given
                let changedEventCalled = false;
                let failedEventCalled = false;
                const fsm = StateMachine.fromType<StringState, Action>('name', TypedState.State1,
                {
                    state: TypedState.State1,
                    actions: [
                    ]
                });
                fsm.start();
                fsm.stateChanged.subscribe(() => { changedEventCalled = true; });
                fsm.stateCstateChangeFailed.subscribe(() => { failedEventCalled = true; });
    
                // When
                fsm.do(Action.Action1);
    
                // Then
                expect(fsm.current).toBe(StringState.State1);
                expect(changedEventCalled).toBe(false);
                expect(failedEventCalled).toBe(true);
            });

            it('should transit to next state when do action if anytime transition is defined', () => {
                // Given
                const fsm = StateMachine.fromType<StringState, Action>('name', TypedState.State1,
                {
                    state: MetaState.Anytime,
                    actions: [
                        [Action.Action1, TypedState.State2]
                    ]
                },
                {
                    state: TypedState.State1,
                    actions: [
                    ]
                });
                fsm.start();
    
                // When
                fsm.do(Action.Action1);
    
                // Then
                expect(fsm.current).toBe(StringState.State2);
            });

            it('should call enter/leave event when do action if event hander is defined', () => {
                // Given
                const fsm = StateMachine.fromType<StringState, Action>('name', FullTypedState.State1,
                {
                    state: MetaState.Anytime,
                    actions: [
                        [Action.Action1, FullTypedState.State2]
                    ]
                },
                {
                    state: FullTypedState.State1,
                    actions: [
                    ]
                });
                fsm.start();
                const calledCount1 = { enter: FullTypedState.State1.enterCalled, leave: FullTypedState.State1.leaveCalled };
                const calledCount2 = { enter: FullTypedState.State2.enterCalled, leave: FullTypedState.State2.leaveCalled };
    
                // When
                fsm.do(Action.Action1);
    
                // Then
                expect(fsm.current).toBe(StringState.State2);
                expect(FullTypedState.State1.enterCalled).toBe(calledCount1.enter);
                expect(FullTypedState.State1.leaveCalled).toBe(calledCount1.leave + 1);
                expect(FullTypedState.State2.enterCalled).toBe(calledCount2.enter + 1);
                expect(FullTypedState.State2.leaveCalled).toBe(calledCount2.leave);
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
                const fsm = StateMachine.fromType<StringState, Action>('name', FullTypedState.State1);
                fsm.start();
                const enterCalled = FullTypedState.State1.enterCalled;
                const leaveCalled = FullTypedState.State1.leaveCalled;

                // When
                fsm.reset();
    
                // Then
                expect(fsm.current).toBe(MetaState.Start);
                expect(FullTypedState.State1.enterCalled).toBe(enterCalled);
                expect(FullTypedState.State1.leaveCalled).toBe(leaveCalled + 1);
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
                const fsm = StateMachine.fromType<StringState, Action>('name', TypedState.State1);
    
                // When
                const result = fsm.can(MetaStateAction.DoStart);
    
                // Then
                expect(result).toBe(true);
            });

            it('should return true when try to do action if transition is defined', () => {
                // Given
                const fsm = StateMachine.fromType<StringState, Action>('name', TypedState.State1,
                {
                    state: TypedState.State1,
                    actions: [
                        [Action.Action1, TypedState.State2]
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
                const fsm = StateMachine.fromType<StringState, Action>('name', TypedState.State1,
                {
                    state: TypedState.State1,
                    actions: [
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
                const fsm = StateMachine.fromType<StringState, Action>('name', TypedState.State1,
                {
                    state: MetaState.Anytime,
                    actions: [
                        [Action.Action1, TypedState.State2]
                    ]
                },
                {
                    state: TypedState.State1,
                    actions: [
                    ]
                });
                fsm.start();
    
                // When
                const result = fsm.can(Action.Action1);
    
                // Then
                expect(result).toBe(true);
            });
        });

        describe('toMachineMap', () => {
            it('should return only meta start map if state is empty', () => {
                // Given
                const name = 'name';
                const fsm = StateMachine.fromString<StringState, Action>(name, StringState.State1);

                // When
                const result = fsm.toMachineMap();

                // Then
                expect(result).toEqual({
                    name,
                    states: [{
                        name: MetaState.StartName,
                        actions: [{
                            name: MetaStateAction.DoStart,
                            destination: StringState.State1
                        }]
                    }]
                });
            });

            it('should return user-defined map if some states are defined', () => {
                // Given
                const name = 'name';
                const fsm = StateMachine.fromString<StringState, Action>(
                    name,
                    StringState.State1,
                    {
                        state: StringState.State1,
                        actions: [
                            [Action.Action1, StringState.State2]
                        ]
                    }
                );

                // When
                const result = fsm.toMachineMap();

                // Then
                expect(result).toEqual({
                    name,
                    states: [{
                        name: StringState.State1,
                        actions: [{
                            name: Action.Action1,
                            destination: StringState.State2
                        }]
                    }, {
                        name: MetaState.StartName,
                        actions: [{
                            name: MetaStateAction.DoStart,
                            destination: StringState.State1
                        }]
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
                        actions: [
                            [Action.Action3, StringState.State1]
                        ]
                    },
                    {
                        state: StringState.State1,
                        actions: [
                            [Action.Action1, StringState.State2]
                        ]
                    },
                    {
                        state: StringState.State2,
                        actions: [
                            [Action.Action2, StringState.State3]
                        ]
                    },
                    {
                        state: StringState.State3,
                        actions: [
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
                        actions: [
                            [Action.Action3, NamedState.State1]
                        ]
                    },
                    {
                        state: NamedState.State1,
                        actions: [
                            [Action.Action1, NamedState.State2]
                        ]
                    },
                    {
                        state: NamedState.State2,
                        actions: [
                            [Action.Action2, NamedState.State3]
                        ]
                    },
                    {
                        state: NamedState.State3,
                        actions: [
                            [Action.Action1, NamedState.State2],
                            [Action.Action3, NamedState.State1]
                        ]
                    }
                );
                const typedFsm = StateMachine.fromType<StringState, Action>(
                    name,
                    TypedState.State1,
                    {
                        state: MetaState.Anytime,
                        actions: [
                            [Action.Action3, TypedState.State1]
                        ]
                    },
                    {
                        state: TypedState.State1,
                        actions: [
                            [Action.Action1, TypedState.State2]
                        ]
                    },
                    {
                        state: TypedState.State2,
                        actions: [
                            [Action.Action2, TypedState.State3]
                        ]
                    },
                    {
                        state: TypedState.State3,
                        actions: [
                            [Action.Action1, TypedState.State2],
                            [Action.Action3, TypedState.State1]
                        ]
                    }
                );

                // When
                const stringResult = stringFsm.toMachineMap();
                const namedResult = namedFsm.toMachineMap();
                const typedResult = typedFsm.toMachineMap();

                // Then
                expect(stringResult).toEqual(namedResult);
                expect(stringResult).toEqual(typedResult);
                expect(namedResult).toEqual(typedResult);
            });
        });

        describe('export', () => {
            it('should pass equal map to toMachineMap', () => {
                // Given
                const name = 'name';
                const fsm = StateMachine.fromString<StringState, Action>(
                    name,
                    StringState.State1,
                    {
                        state: StringState.State1,
                        actions: [
                            [Action.Action1, StringState.State2]
                        ]
                    }
                );
                const result = 'result';
                let actualMap: StateMachineMap;
                const writer = (map: StateMachineMap) => {
                    actualMap = map;
                    return result;
                };

                // When
                const actualResult = fsm.export(writer);

                // Then
                expect(actualResult).toBe(result);
                expect(actualMap).toEqual(fsm.toMachineMap());
            });
        });

        describe('historyCapacity', () => {
            it('should set normally if not negative value was set', () => {
                // Given
                const capacity = 10;
                const fsm = StateMachine.fromString('nane', StringState.State1);

                // When
                fsm.historyCapacity = capacity;

                // Then
                expect(fsm.historyCapacity).toBe(capacity);
            });

            it('should set zero if negative value was set', () => {
                // Given
                const capacity = -1;
                const fsm = StateMachine.fromString('nane', StringState.State1);

                // When
                fsm.historyCapacity = capacity;

                // Then
                expect(fsm.historyCapacity).toBe(0);
            });
        })

        describe('histories', () => {
            it('should return histories', () => {
                // Given
                const fsm = StateMachine.fromString<StringState, Action>('name', StringState.State1,
                {
                    state: StringState.State1,
                    actions: [
                        [Action.Action1, StringState.State2]
                    ]
                }, {
                    state: StringState.State2,
                    actions: [
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
                    new StateHistory(undefined, MetaState.StartName, StringState.State1, MetaStateAction.DoStart),
                    new StateHistory(undefined, StringState.State1, StringState.State2, Action.Action1),
                    new StateHistory(undefined, StringState.State2, StringState.State1, Action.Action2),
                    new StateHistory(undefined, StringState.State1, undefined, Action.Action2),
                ];
                expect(histories.length).toBe(expected.length);
                for (let i = 0; i < expected.length; i++) {
                    expect(histories[i].oldState).toBe(expected[i].oldState);
                    expect(histories[i].newState).toBe(expected[i].newState);
                    expect(histories[i].action).toBe(expected[i].action);
                }
            });

            it('should return limited size histories if history is overflow', () => {
                // Given
                const fsm = StateMachine.fromString<StringState, Action>('name', StringState.State1,
                {
                    state: StringState.State1,
                    actions: [
                        [Action.Action1, StringState.State2]
                    ]
                }, {
                    state: StringState.State2,
                    actions: [
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
                    actions: [
                        [Action.Action1, StringState.State2]
                    ]
                }, {
                    state: StringState.State2,
                    actions: [
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
