import { StateMachineItem, StateType } from './interface';

export type NolItem<S, A extends string, P = {}> = StateMachineItem<StateType<S, A, P>, A>;
