"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_fixture_1 = require("../__fixtures__/connection.fixture");
const test_entity_1 = require("../__fixtures__/test.entity");
const query_1 = require("../../src/query");
describe('AggregateBuilder', () => {
    beforeEach(connection_fixture_1.createTestConnection);
    afterEach(connection_fixture_1.closeTestConnection);
    const getRepo = () => connection_fixture_1.getTestConnection().getRepository(test_entity_1.TestEntity);
    const getQueryBuilder = () => getRepo().createQueryBuilder();
    const createAggregateBuilder = () => new query_1.AggregateBuilder();
    const expectSQLSnapshot = (agg) => {
        const selectQueryBuilder = createAggregateBuilder().build(getQueryBuilder(), agg, 'TestEntity');
        const [sql, params] = selectQueryBuilder.getQueryAndParameters();
        expect(sql).toMatchSnapshot();
        expect(params).toMatchSnapshot();
    };
    it('should throw an error if no selects are generated', () => {
        expect(() => createAggregateBuilder().build(getQueryBuilder(), {})).toThrow('No aggregate fields found.');
    });
    it('should create selects for all aggregate functions', () => {
        expectSQLSnapshot({
            count: ['testEntityPk'],
            avg: ['numberType'],
            sum: ['numberType'],
            max: ['stringType', 'dateType', 'numberType'],
            min: ['stringType', 'dateType', 'numberType'],
        });
    });
    it('should create selects for all aggregate functions and group bys', () => {
        expectSQLSnapshot({
            groupBy: ['stringType', 'boolType'],
            count: ['testEntityPk'],
        });
    });
    describe('.convertToAggregateResponse', () => {
        it('should convert a flat response into an Aggregate response', () => {
            const dbResult = [
                {
                    GROUP_BY_stringType: 'z',
                    COUNT_testEntityPk: 10,
                    SUM_numberType: 55,
                    AVG_numberType: 5,
                    MAX_stringType: 'z',
                    MAX_numberType: 10,
                    MIN_stringType: 'a',
                    MIN_numberType: 1,
                },
            ];
            expect(query_1.AggregateBuilder.convertToAggregateResponse(dbResult)).toEqual([
                {
                    groupBy: { stringType: 'z' },
                    count: { testEntityPk: 10 },
                    sum: { numberType: 55 },
                    avg: { numberType: 5 },
                    max: { stringType: 'z', numberType: 10 },
                    min: { stringType: 'a', numberType: 1 },
                },
            ]);
        });
        it('should throw an error if a column is not expected', () => {
            const dbResult = [
                {
                    COUNTtestEntityPk: 10,
                },
            ];
            expect(() => query_1.AggregateBuilder.convertToAggregateResponse(dbResult)).toThrow('Unknown aggregate column encountered.');
        });
    });
});
//# sourceMappingURL=aggregate.builder.spec.js.map