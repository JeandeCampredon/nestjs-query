"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_fixture_1 = require("../__fixtures__/connection.fixture");
const test_entity_1 = require("../__fixtures__/test.entity");
const query_1 = require("../../src/query");
describe('WhereBuilder', () => {
    beforeEach(connection_fixture_1.createTestConnection);
    afterEach(connection_fixture_1.closeTestConnection);
    const getRepo = () => connection_fixture_1.getTestConnection().getRepository(test_entity_1.TestEntity);
    const getQueryBuilder = () => getRepo().createQueryBuilder();
    const createWhereBuilder = () => new query_1.WhereBuilder();
    const expectSQLSnapshot = (filter) => {
        const selectQueryBuilder = createWhereBuilder().build(getQueryBuilder(), filter, [], 'TestEntity');
        const [sql, params] = selectQueryBuilder.getQueryAndParameters();
        expect(sql).toMatchSnapshot();
        expect(params).toMatchSnapshot();
    };
    it('should accept a empty filter', () => {
        expectSQLSnapshot({});
    });
    it('or multiple operators for a single field together', () => {
        expectSQLSnapshot({ numberType: { gt: 10, lt: 20, gte: 21, lte: 31 } });
    });
    it('and multiple field comparisons together', () => {
        expectSQLSnapshot({ numberType: { eq: 1 }, stringType: { like: 'foo%' }, boolType: { is: true } });
    });
    describe('and', () => {
        it('and multiple expressions together', () => {
            expectSQLSnapshot({
                and: [
                    { numberType: { gt: 10 } },
                    { numberType: { lt: 20 } },
                    { numberType: { gte: 30 } },
                    { numberType: { lte: 40 } },
                ],
            });
        });
        it('and multiple filters together with multiple fields', () => {
            expectSQLSnapshot({
                and: [
                    { numberType: { gt: 10 }, stringType: { like: 'foo%' } },
                    { numberType: { lt: 20 }, stringType: { like: '%bar' } },
                ],
            });
        });
        it('should support nested ors', () => {
            expectSQLSnapshot({
                and: [
                    { or: [{ numberType: { gt: 10 } }, { numberType: { lt: 20 } }] },
                    { or: [{ numberType: { gte: 30 } }, { numberType: { lte: 40 } }] },
                ],
            });
        });
        it('should properly group AND with a sibling field comparison', () => {
            expectSQLSnapshot({ and: [{ numberType: { gt: 2 } }, { numberType: { lt: 10 } }], stringType: { eq: 'foo' } });
        });
    });
    describe('or', () => {
        it('or multiple expressions together', () => {
            expectSQLSnapshot({
                or: [
                    { numberType: { gt: 10 } },
                    { numberType: { lt: 20 } },
                    { numberType: { gte: 30 } },
                    { numberType: { lte: 40 } },
                ],
            });
        });
        it('and multiple and filters together', () => {
            expectSQLSnapshot({
                or: [
                    { numberType: { gt: 10 }, stringType: { like: 'foo%' } },
                    { numberType: { lt: 20 }, stringType: { like: '%bar' } },
                ],
            });
        });
        it('should support nested ands', () => {
            expectSQLSnapshot({
                or: [
                    { and: [{ numberType: { gt: 10 } }, { numberType: { lt: 20 } }] },
                    { and: [{ numberType: { gte: 30 } }, { numberType: { lte: 40 } }] },
                ],
            });
        });
        it('should properly group OR with a sibling field comparison', () => {
            expectSQLSnapshot({ or: [{ numberType: { eq: 2 } }, { numberType: { gt: 10 } }], stringType: { eq: 'foo' } });
        });
    });
});
//# sourceMappingURL=where.builder.spec.js.map