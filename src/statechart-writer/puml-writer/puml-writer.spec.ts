import { PumlWriter } from './puml-writer';
import { Statechart, StatechartItem, StatechartTransition } from '../../interface';
import { AutoIndex } from '../interface';
import { MetaState } from '../../state-meta';


describe('PumlWriter', () => {
    describe('static', () => {
        describe('getWriter()', () => {
            it('should return a writer', () => {
                // Given
                const opt = undefined;

                // When
                const writer = PumlWriter.getWriter(opt);

                // Then
                expect(writer).toBeTruthy();
            });
        });

        describe('export(without children)', () => {
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
                expect(result).toMatch(escape('state "State1" as State1'));
                expect(result).toMatch(escape('state "State2" as State2'));
                expect(result).toMatch(escape('[*] -->'));
                expect(result).toMatch(escape('-down->'));
                expect(result).not.toMatch(escape('-up->'));
                expect(result).not.toMatch(escape('-left->'));
                expect(result).not.toMatch(escape('-right->'));
                expect(result).toMatch(escape('(a1)'));
            });

            it('should return no-index optioned machine map', () => {
                // Given
                const writer = PumlWriter.getWriter({autoIndex: undefined});

                // When
                const result = writer(map);

                // Then
                expect(result).toMatch(escape('state "State1" as State1'));
                expect(result).toMatch(escape('state "State2" as State2'));
                expect(result).toMatch(escape('[*] -->'));
                expect(result).toMatch(escape('-down->'));
                expect(result).not.toMatch(escape('-up->'));
                expect(result).not.toMatch(escape('-left->'));
                expect(result).not.toMatch(escape('-right->'));
                expect(result).not.toMatch(escape('(1)'));
                expect(result).toMatch(escape('OK,Next'));
            });

            it('should return auto-number machine map', () => {
                // Given
                const writer = PumlWriter.getWriter({autoIndex: AutoIndex.Number});

                // When
                const result = writer(map);

                // Then
                expect(result).toMatch(escape('state "State1" as State1'));
                expect(result).toMatch(escape('state "State2" as State2'));
                expect(result).toMatch(escape('[*] -->'));
                expect(result).toMatch(escape('-down->'));
                expect(result).toMatch(escape('(1)'));
                expect(result).toMatch(escape('(2),(3)'));
            });

            it('should return default arrow machine map', () => {
                // Given
                const writer = PumlWriter.getWriter();

                // When
                const result = writer(map);

                // Then
                expect(result).toMatch(escape('state "State1" as State1'));
                expect(result).toMatch(escape('state "State2" as State2'));
                expect(result).toMatch(escape('[*] -->'));
                expect(result).toMatch(escape('-down->'));
                expect(result).not.toMatch(escape('(1)'));
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
                expect(result).toMatch(escape('State1 -up-> State2'));

                expect(result).toMatch(escape('State2 -right-> State1'));
                expect(result).toMatch(escape('State2 -up-> State3'));

                expect(result).toMatch(escape('State3 -down-> State1'));
                expect(result).toMatch(escape('State3 -up-> State2'));
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
                expect(result).toMatch(escape('-right-> State1'));
                expect(result).toMatch(escape('State1 -left->'));
            });

            it('should return positioned machine map', () => {
                // Given
                const writer = PumlWriter.getWriter({
                    positions: [
                        { state: 'State1', x: 3 },
                        { state: 'State2', x: 1, y: 4 },
                        { state: 'State3', x: -5 },
                    ]
                });

                // When
                const result = writer(map);

                // Then
                expect(result).toMatch(escape('State1 -down-> State2'));
                expect(result).toMatch(escape('State2 -up-> State1'));
                expect(result).toMatch(escape('State2 -left-> State3'));
                expect(result).toMatch(escape('State3 -right-> State2'));
                expect(result).toMatch(escape('State3 -right-> State1'));
            });
        });

        describe('export(with children)', () => {
            const map: Statechart = {
                name: 'SampleState',
                states: [
                    item(MetaState.StartName, [transition('', 'State1')]),
                    item('State1', [transition('Next', 'State2')]),
                    item('State2', [
                        transition('Prev', 'State1'),
                    ], [
                        item('State2-1', [transition('Reset', 'State1')]),
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
                expect(result).toMatch(escape('state "State2" as State2 {'));
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

function escape(s: string) {  
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
