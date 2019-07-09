import { PumlWriter } from './puml-writer';
import { StateMachineMap, StateMachineMapItem, PumlWriterOptions, AutoIndex } from './interface';
import { MetaState } from './state-meta';


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
            const map: StateMachineMap = {
                name: 'SampleState',
                states: [{
                    name: MetaState.StartName,
                    actions: [{
                        name: '',
                        destination: 'State1'
                    }]
                }, {
                    name: 'State1',
                    actions: [{
                        name: 'Next',
                        destination: 'State2'
                    }]
                }, {
                    name: 'State2',
                    actions: [{
                        name: 'OK',
                        destination: 'State3'
                    }, {
                        name: 'Next',
                        destination: 'State3'
                    }, {
                        name: 'Prev',
                        destination: 'State1'
                    }]
                }, {
                    name: 'State3',
                    actions: [{
                        name: 'Next',
                        destination: 'State1'
                    }, {
                        name: 'Prev',
                        destination: 'State2'
                    }]
                }] as StateMachineMapItem[]
            };

            it('shuold return default optioned machine map', () => {
                // Given
                const writer = PumlWriter.getWriter();

                // When
                const result = writer(map);

                // Then
                expect(result.includes('state "State1" as state1')).toBeTruthy();
                expect(result.includes('state "State2" as state2')).toBeTruthy();
                expect(result.includes('[*] -->')).toBeTruthy();
                expect(result.includes('-down->')).toBeTruthy();
                expect(result.includes('-up->')).toBeFalsy();
                expect(result.includes('-left->')).toBeFalsy();
                expect(result.includes('-right->')).toBeFalsy();
                expect(result.includes('(a1)')).toBeTruthy();
            });

            it('shuold return no-index optioned machine map', () => {
                // Given
                const writer = PumlWriter.getWriter({autoIndex: undefined});

                // When
                const result = writer(map);

                // Then
                expect(result.includes('state "State1" as state1')).toBeTruthy();
                expect(result.includes('state "State2" as state2')).toBeTruthy();
                expect(result.includes('[*] -->')).toBeTruthy();
                expect(result.includes('-down->')).toBeTruthy();
                expect(result.includes('-up->')).toBeFalsy();
                expect(result.includes('-left->')).toBeFalsy();
                expect(result.includes('-right->')).toBeFalsy();
                expect(result.includes('(1)')).toBeFalsy();
                expect(result.includes('OK,Next')).toBeTruthy();
            });

            it('shuold return auto-number machine map', () => {
                // Given
                const writer = PumlWriter.getWriter({autoIndex: AutoIndex.Number});

                // When
                const result = writer(map);

                // Then
                expect(result.includes('state "State1" as state1')).toBeTruthy();
                expect(result.includes('state "State2" as state2')).toBeTruthy();
                expect(result.includes('[*] -->')).toBeTruthy();
                expect(result.includes('-down->')).toBeTruthy();
                expect(result.includes('(1)')).toBeTruthy();
                expect(result.includes('(2),(3)')).toBeTruthy();
            });

            it('shuold return default arrow machine map', () => {
                // Given
                const writer = PumlWriter.getWriter();

                // When
                const result = writer(map);

                // Then
                expect(result.includes('state "State1" as state1')).toBeTruthy();
                expect(result.includes('state "State2" as state2')).toBeTruthy();
                expect(result.includes('[*] -->')).toBeTruthy();
                expect(result.includes('-down->')).toBeTruthy();
                expect(result.includes('(1)')).toBeFalsy();
            });

            it('shuold return customized arrow machine map', () => {
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
                expect(result.includes('state1 -up-> state2')).toBeTruthy();

                expect(result.includes('state2 -right-> state1')).toBeTruthy();
                expect(result.includes('state2 -up-> state3')).toBeTruthy();

                expect(result.includes('state3 -down-> state1')).toBeTruthy();
                expect(result.includes('state3 -up-> state2')).toBeTruthy();
            });

            it('shuold return both way arrow machine map', () => {
                // Given
                const writer = PumlWriter.getWriter({
                    arrows: [{
                        to: 'State1',
                        direction: 'right',
                        bothWay: true,
                    }]
                });

                // When
                const result = writer(map);

                // Then
                expect(result.includes('-right-> state1')).toBeTruthy();
                expect(result.includes('state1 -left->')).toBeTruthy();
            });
        });
    });
});