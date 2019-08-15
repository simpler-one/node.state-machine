import { PumlWriter } from './puml-writer';
import { Statechart, StatechartItem, StatechartTransition } from '../../interface';
import { AutoIndex } from '../interface';
import { MetaState } from '../../state-meta';
import { escapeRegexp as esc } from '../../utils';
import { ArrowDirection } from './interface';


describe('PumlWriter', () => {
    describe('static', () => {
        xdescribe('getWriter()', () => {
            it('should return a writer', () => {
                // Given
                const opt = undefined;

                // When
                const writer = PumlWriter.getWriter(opt);

                // Then
                expect(writer).toBeTruthy();
            });
        });

        xdescribe('export(without children)', () => {
            const map: Statechart = {
                name: 'SampleState',
                states: [
                    item(MetaState.StartName, [transition('', 'State1')]),
                    item('State1', [transition('Next', 'State2')]),
                    item('State2', [
                        transition('OK', 'State3'),
                        transition('Next', 'State3'),
                        transition('Prev', 'State1'),
                    ]),
                    item('State3', [
                        transition('Next', 'State1'),
                        transition('Prev', 'State2'),
                    ])
                ]
            };

            it('should return default optioned machine map', () => {
                // Given
                const writer = PumlWriter.getWriter();

                // When
                const result = writer(map);

                // Then
                expect(result).toMatch(esc('state "State1" as State1'));
                expect(result).toMatch(esc('state "State2" as State2'));
                expect(result).toMatch(esc('[*] -->'));
                expect(result).toMatch(esc('-down->'));
                expect(result).not.toMatch(esc('-up->'));
                expect(result).not.toMatch(esc('-left->'));
                expect(result).not.toMatch(esc('-right->'));
                expect(result).toMatch(esc('(a1)'));
            });

            it('should return no-index optioned machine map', () => {
                // Given
                const writer = PumlWriter.getWriter({autoIndex: undefined});

                // When
                const result = writer(map);

                // Then
                expect(result).toMatch(esc('state "State1" as State1'));
                expect(result).toMatch(esc('state "State2" as State2'));
                expect(result).toMatch(esc('[*] -->'));
                expect(result).toMatch(esc('-down->'));
                expect(result).not.toMatch(esc('-up->'));
                expect(result).not.toMatch(esc('-left->'));
                expect(result).not.toMatch(esc('-right->'));
                expect(result).not.toMatch(esc('(1)'));
                expect(result).toMatch(esc('OK,Next'));
            });

            it('should return auto-number machine map', () => {
                // Given
                const writer = PumlWriter.getWriter({autoIndex: AutoIndex.Number});

                // When
                const result = writer(map);

                // Then
                expect(result).toMatch(esc('state "State1" as State1'));
                expect(result).toMatch(esc('state "State2" as State2'));
                expect(result).toMatch(esc('[*] -->'));
                expect(result).toMatch(esc('-down->'));
                expect(result).toMatch(esc('(1)'));
                expect(result).toMatch(esc('(2),(3)'));
            });

            it('should return default arrow machine map', () => {
                // Given
                const writer = PumlWriter.getWriter();

                // When
                const result = writer(map);

                // Then
                expect(result).toMatch(esc('state "State1" as State1'));
                expect(result).toMatch(esc('state "State2" as State2'));
                expect(result).toMatch(esc('[*] -->'));
                expect(result).toMatch(esc('-down->'));
                expect(result).not.toMatch(esc('(1)'));
            });

            it('should return customized arrow machine map', () => {
                // Given
                const writer = PumlWriter.getWriter({
                    arrows: [{
                        direction: 'up',
                    }, {
                        to: 'State1',
                        direction: 'down',
                    }, {
                        from: 'State2',
                        to: 'State1',
                        direction: 'right',
                    }]
                });

                // When
                const result = writer(map);

                // Then
                expect(result).toMatch(esc('State1 -up-> State2'));

                expect(result).toMatch(esc('State2 -right-> State1'));
                expect(result).toMatch(esc('State2 -up-> State3'));

                expect(result).toMatch(esc('State3 -down-> State1'));
                expect(result).toMatch(esc('State3 -up-> State2'));
            });

            it('should return both way arrow machine map', () => {
                // Given
                const writer = PumlWriter.getWriter({
                    arrows: [{
                        to: 'State1',
                        direction: 'right',
                        bothWays: true,
                    }]
                });

                // When
                const result = writer(map);

                // Then
                expect(result).toMatch(esc('-right-> State1'));
                expect(result).toMatch(esc('State1 -left->'));
            });

            it('should return positioned machine map', () => {
                // Given
                const writer = PumlWriter.getWriter({
                    states: [
                        { name: 'State1', x: 3 },
                        { name: 'State2', x: 1, y: 4 },
                        { name: 'State3', x: -5 },
                    ]
                });

                // When
                const result = writer(map);

                // Then
                expect(result).toMatch(esc('State1 -down-> State2'));
                expect(result).toMatch(esc('State2 -up-> State1'));
                expect(result).toMatch(esc('State2 -left-> State3'));
                expect(result).toMatch(esc('State3 -right-> State2'));
                expect(result).toMatch(esc('State3 -right-> State1'));
            });
        });

        describe('export(with children)', () => {
            const map: Statechart = {
                name: 'SampleState',
                states: [
                    item(MetaState.StartName, [transition('', 'State1')]),
                    item('State1', [transition('Next', 'State2-1')]),
                    item('State2', [
                        transition('Prev', 'State1'),
                    ], [
                        item('State2-1', [transition('Reset', 'State1'), transition('Go', 'State2-2')]),
                        item('State2-2', [transition('Reset', 'State1'), transition('3', 'State3')]),
                    ]),
                    item('State3', [
                        transition('Next', 'State1'),
                        transition('Prev', 'State2'),
                    ])
                ]
            };

            xit('should return default optioned machine map', () => {
                // Given
                const writer = PumlWriter.getWriter();
                // When
                const result = writer(map);
                // Then
                expect(result).toMatch(esc('state "State2" as State2 {'));
            });

            xit('should return auto-bundled machine map', () => {
                // Given
                const writer = PumlWriter.getWriter({ autoBundleOutgo: true });
                // When
                const result = writer(map);
                // Then
                expect(result).toMatch(esc('<<choice>>'));
            });

            it('should return inner-directed machine map', () => {
                // Given
                const writer = PumlWriter.getWriter({
                    states: [
                        { name: 'State1', x: 3 },
                        { name: 'State2', x: 1, y: 4, innerDirection: ArrowDirection.Left },
                    ]
                });

                // When
                const result = writer(map);

                // Then
                expect(result).toMatch(esc('State2 -up-> State1'));
                expect(result).toMatch(esc('State2_1 -left-> State2_2'));
            });
        });
    });
});


function item(name: string, transitions: StatechartTransition[], children: StatechartItem[] = []): StatechartItem {
    return {
        name,
        transitions,
        children,
    };
}

function transition(action: string, destination: string): StatechartTransition {
    return {
        action,
        destination,
    };
}
