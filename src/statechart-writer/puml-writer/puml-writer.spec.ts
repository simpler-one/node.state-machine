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

        describe('export()', () => {
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
                expect(result.includes('state "State1" as State1')).toBeTruthy();
                expect(result.includes('state "State2" as State2')).toBeTruthy();
                expect(result.includes('[*] -->')).toBeTruthy();
                expect(result.includes('-down->')).toBeTruthy();
                expect(result.includes('-up->')).toBeFalsy();
                expect(result.includes('-left->')).toBeFalsy();
                expect(result.includes('-right->')).toBeFalsy();
                expect(result.includes('(a1)')).toBeTruthy();
            });

            it('should return no-index optioned machine map', () => {
                // Given
                const writer = PumlWriter.getWriter({autoIndex: undefined});

                // When
                const result = writer(map);

                // Then
                expect(result.includes('state "State1" as State1')).toBeTruthy();
                expect(result.includes('state "State2" as State2')).toBeTruthy();
                expect(result.includes('[*] -->')).toBeTruthy();
                expect(result.includes('-down->')).toBeTruthy();
                expect(result.includes('-up->')).toBeFalsy();
                expect(result.includes('-left->')).toBeFalsy();
                expect(result.includes('-right->')).toBeFalsy();
                expect(result.includes('(1)')).toBeFalsy();
                expect(result.includes('OK,Next')).toBeTruthy();
            });

            it('should return auto-number machine map', () => {
                // Given
                const writer = PumlWriter.getWriter({autoIndex: AutoIndex.Number});

                // When
                const result = writer(map);

                // Then
                expect(result.includes('state "State1" as State1')).toBeTruthy();
                expect(result.includes('state "State2" as State2')).toBeTruthy();
                expect(result.includes('[*] -->')).toBeTruthy();
                expect(result.includes('-down->')).toBeTruthy();
                expect(result.includes('(1)')).toBeTruthy();
                expect(result.includes('(2),(3)')).toBeTruthy();
            });

            it('should return default arrow machine map', () => {
                // Given
                const writer = PumlWriter.getWriter();

                // When
                const result = writer(map);

                // Then
                expect(result.includes('state "State1" as State1')).toBeTruthy();
                expect(result.includes('state "State2" as State2')).toBeTruthy();
                expect(result.includes('[*] -->')).toBeTruthy();
                expect(result.includes('-down->')).toBeTruthy();
                expect(result.includes('(1)')).toBeFalsy();
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
                expect(result.includes('State1 -up-> State2')).toBeTruthy();

                expect(result.includes('State2 -right-> State1')).toBeTruthy();
                expect(result.includes('State2 -up-> State3')).toBeTruthy();

                expect(result.includes('State3 -down-> State1')).toBeTruthy();
                expect(result.includes('State3 -up-> State2')).toBeTruthy();
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
                expect(result.includes('-right-> State1')).toBeTruthy();
                expect(result.includes('State1 -left->')).toBeTruthy();
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
                expect(result.includes('State1 -down-> State2')).toBeTruthy();
                expect(result.includes('State2 -up-> State1')).toBeTruthy();
                expect(result.includes('State2 -left-> State3')).toBeTruthy();
                expect(result.includes('State3 -right-> State2')).toBeTruthy();
                expect(result.includes('State3 -right-> State1')).toBeTruthy();
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
