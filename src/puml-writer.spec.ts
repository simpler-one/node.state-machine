/// <reference path=",,/../../node_modules/@types/jasmine/index.d.ts" />
import { PumlWriter } from './puml-writer';
import { StateMachineMap, StateMachineMapItem, StateMachineMapAction } from './interface';
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
            it('shuold return default optioned machine map', () => {
                // Given
                const writer = PumlWriter.getWriter();
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
                            name: 'Next',
                            destination: 'State1'
                        }]
                    }] as StateMachineMapItem[]
                };

                // When
                const result = writer(map)

                // Then
                expect(result.includes('state "State1" as state1')).toBeTruthy();
                expect(result.includes('state "State2" as state2')).toBeTruthy();
                expect(result.includes('[*] -->')).toBeTruthy();
                expect(result.includes('-down->')).toBeTruthy();
                expect(result.includes('(1)')).toBeFalsy();
                console.log(result);
            });
        });
    });
});