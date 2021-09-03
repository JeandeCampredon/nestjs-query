"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_mockito_1 = require("ts-mockito");
const core_1 = require("@nestjs-query/core");
const connection_fixture_1 = require("../__fixtures__/connection.fixture");
const test_soft_delete_entity_1 = require("../__fixtures__/test-soft-delete.entity");
const test_entity_1 = require("../__fixtures__/test.entity");
const query_1 = require("../../src/query");
describe('FilterQueryBuilder', () => {
    beforeEach(connection_fixture_1.createTestConnection);
    afterEach(connection_fixture_1.closeTestConnection);
    const getEntityQueryBuilder = (entity, whereBuilder) => new query_1.FilterQueryBuilder(connection_fixture_1.getTestConnection().getRepository(entity), whereBuilder);
    const expectSQLSnapshot = (query) => {
        const [sql, params] = query.getQueryAndParameters();
        expect(sql).toMatchSnapshot();
        expect(params).toMatchSnapshot();
    };
    describe('#select', () => {
        const expectSelectSQLSnapshot = (query, whereBuilder) => {
            const selectQueryBuilder = getEntityQueryBuilder(test_entity_1.TestEntity, whereBuilder).select(query);
            expectSQLSnapshot(selectQueryBuilder);
        };
        describe('with filter', () => {
            it('should not call whereBuilder#build', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectSelectSQLSnapshot({}, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), [], 'TestEntity')).never();
            });
            it('should call whereBuilder#build if there is a filter', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                const query = { filter: { stringType: { eq: 'foo' } } };
                ts_mockito_1.when(mockWhereBuilder.build(ts_mockito_1.anything(), query.filter, ts_mockito_1.deepEqual([]), 'TestEntity')).thenCall((where, field, relationNames, alias) => where.andWhere(`${alias}.stringType = 'foo'`));
                expectSelectSQLSnapshot(query, ts_mockito_1.instance(mockWhereBuilder));
            });
        });
        describe('with paging', () => {
            it('should apply empty paging args', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectSelectSQLSnapshot({}, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), ts_mockito_1.deepEqual([]), 'TestEntity')).never();
            });
            it('should apply paging args going forward', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectSelectSQLSnapshot({ paging: { limit: 10, offset: 11 } }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), ts_mockito_1.deepEqual([]), 'TestEntity')).never();
            });
            it('should apply paging args going backward', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectSelectSQLSnapshot({ paging: { limit: 10, offset: 10 } }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), [], 'TestEntity')).never();
            });
        });
        describe('with sorting', () => {
            it('should apply ASC sorting', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectSelectSQLSnapshot({ sorting: [{ field: 'numberType', direction: core_1.SortDirection.ASC }] }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), [], 'TestEntity')).never();
            });
            it('should apply ASC NULLS_FIRST sorting', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectSelectSQLSnapshot({ sorting: [{ field: 'numberType', direction: core_1.SortDirection.ASC, nulls: core_1.SortNulls.NULLS_FIRST }] }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), [], 'TestEntity')).never();
            });
            it('should apply ASC NULLS_LAST sorting', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectSelectSQLSnapshot({ sorting: [{ field: 'numberType', direction: core_1.SortDirection.ASC, nulls: core_1.SortNulls.NULLS_LAST }] }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), [], 'TestEntity')).never();
            });
            it('should apply DESC sorting', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectSelectSQLSnapshot({ sorting: [{ field: 'numberType', direction: core_1.SortDirection.DESC }] }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), [], 'TestEntity')).never();
            });
            it('should apply DESC NULLS_FIRST sorting', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectSelectSQLSnapshot({ sorting: [{ field: 'numberType', direction: core_1.SortDirection.DESC, nulls: core_1.SortNulls.NULLS_FIRST }] }, ts_mockito_1.instance(mockWhereBuilder));
            });
            it('should apply DESC NULLS_LAST sorting', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectSelectSQLSnapshot({ sorting: [{ field: 'numberType', direction: core_1.SortDirection.DESC, nulls: core_1.SortNulls.NULLS_LAST }] }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), [], 'TestEntity')).never();
            });
            it('should apply multiple sorts', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectSelectSQLSnapshot({
                    sorting: [
                        { field: 'numberType', direction: core_1.SortDirection.ASC },
                        { field: 'boolType', direction: core_1.SortDirection.DESC },
                        { field: 'stringType', direction: core_1.SortDirection.ASC, nulls: core_1.SortNulls.NULLS_FIRST },
                        { field: 'dateType', direction: core_1.SortDirection.DESC, nulls: core_1.SortNulls.NULLS_LAST },
                    ],
                }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), [], 'TestEntity')).never();
            });
        });
    });
    describe('#update', () => {
        const expectUpdateSQLSnapshot = (query, whereBuilder) => {
            const queryBuilder = getEntityQueryBuilder(test_entity_1.TestEntity, whereBuilder).update(query).set({ stringType: 'baz' });
            expectSQLSnapshot(queryBuilder);
        };
        describe('with filter', () => {
            it('should call whereBuilder#build if there is a filter', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                const query = { filter: { stringType: { eq: 'foo' } } };
                ts_mockito_1.when(mockWhereBuilder.build(ts_mockito_1.anything(), query.filter, ts_mockito_1.deepEqual([]), undefined)).thenCall((where) => where.andWhere(`stringType = 'foo'`));
                expectUpdateSQLSnapshot(query, ts_mockito_1.instance(mockWhereBuilder));
            });
        });
        describe('with paging', () => {
            it('should ignore paging args', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectUpdateSQLSnapshot({ paging: { limit: 10, offset: 11 } }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), ts_mockito_1.anything())).never();
            });
        });
        describe('with sorting', () => {
            it('should apply ASC sorting', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectUpdateSQLSnapshot({ sorting: [{ field: 'numberType', direction: core_1.SortDirection.ASC }] }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), ts_mockito_1.anything())).never();
            });
            it('should apply ASC NULLS_FIRST sorting', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectUpdateSQLSnapshot({ sorting: [{ field: 'numberType', direction: core_1.SortDirection.ASC, nulls: core_1.SortNulls.NULLS_FIRST }] }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), ts_mockito_1.anything())).never();
            });
            it('should apply ASC NULLS_LAST sorting', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectUpdateSQLSnapshot({ sorting: [{ field: 'numberType', direction: core_1.SortDirection.ASC, nulls: core_1.SortNulls.NULLS_LAST }] }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), ts_mockito_1.anything())).never();
            });
            it('should apply DESC sorting', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectUpdateSQLSnapshot({ sorting: [{ field: 'numberType', direction: core_1.SortDirection.DESC }] }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), ts_mockito_1.anything())).never();
            });
            it('should apply DESC NULLS_FIRST sorting', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectUpdateSQLSnapshot({ sorting: [{ field: 'numberType', direction: core_1.SortDirection.DESC, nulls: core_1.SortNulls.NULLS_FIRST }] }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), ts_mockito_1.anything())).never();
            });
            it('should apply DESC NULLS_LAST sorting', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectUpdateSQLSnapshot({ sorting: [{ field: 'numberType', direction: core_1.SortDirection.DESC, nulls: core_1.SortNulls.NULLS_LAST }] }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), ts_mockito_1.anything())).never();
            });
            it('should apply multiple sorts', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectUpdateSQLSnapshot({
                    sorting: [
                        { field: 'numberType', direction: core_1.SortDirection.ASC },
                        { field: 'boolType', direction: core_1.SortDirection.DESC },
                        { field: 'stringType', direction: core_1.SortDirection.ASC, nulls: core_1.SortNulls.NULLS_FIRST },
                        { field: 'dateType', direction: core_1.SortDirection.DESC, nulls: core_1.SortNulls.NULLS_LAST },
                    ],
                }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), ts_mockito_1.anything())).never();
            });
        });
    });
    describe('#delete', () => {
        const expectDeleteSQLSnapshot = (query, whereBuilder) => {
            const selectQueryBuilder = getEntityQueryBuilder(test_entity_1.TestEntity, whereBuilder).delete(query);
            expectSQLSnapshot(selectQueryBuilder);
        };
        describe('with filter', () => {
            it('should call whereBuilder#build if there is a filter', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                const query = { filter: { stringType: { eq: 'foo' } } };
                ts_mockito_1.when(mockWhereBuilder.build(ts_mockito_1.anything(), query.filter, ts_mockito_1.deepEqual([]), undefined)).thenCall((where) => where.andWhere(`stringType = 'foo'`));
                expectDeleteSQLSnapshot(query, ts_mockito_1.instance(mockWhereBuilder));
            });
        });
        describe('with paging', () => {
            it('should ignore paging args', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectDeleteSQLSnapshot({ paging: { limit: 10, offset: 11 } }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), ts_mockito_1.anything())).never();
            });
        });
        describe('with sorting', () => {
            it('should ignore sorting', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectDeleteSQLSnapshot({
                    sorting: [
                        { field: 'numberType', direction: core_1.SortDirection.ASC },
                        { field: 'boolType', direction: core_1.SortDirection.DESC },
                        { field: 'stringType', direction: core_1.SortDirection.ASC, nulls: core_1.SortNulls.NULLS_FIRST },
                        { field: 'dateType', direction: core_1.SortDirection.DESC, nulls: core_1.SortNulls.NULLS_LAST },
                    ],
                }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), ts_mockito_1.anything())).never();
            });
        });
    });
    describe('#softDelete', () => {
        const expectSoftDeleteSQLSnapshot = (query, whereBuilder) => {
            const selectQueryBuilder = getEntityQueryBuilder(test_soft_delete_entity_1.TestSoftDeleteEntity, whereBuilder).softDelete(query);
            expectSQLSnapshot(selectQueryBuilder);
        };
        describe('with filter', () => {
            it('should call whereBuilder#build if there is a filter', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                const query = { filter: { stringType: { eq: 'foo' } } };
                ts_mockito_1.when(mockWhereBuilder.build(ts_mockito_1.anything(), query.filter, ts_mockito_1.deepEqual([]), undefined)).thenCall((where) => where.andWhere(`stringType = 'foo'`));
                expectSoftDeleteSQLSnapshot(query, ts_mockito_1.instance(mockWhereBuilder));
            });
        });
        describe('with paging', () => {
            it('should ignore paging args', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectSoftDeleteSQLSnapshot({ paging: { limit: 10, offset: 11 } }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), ts_mockito_1.anything())).never();
            });
        });
        describe('with sorting', () => {
            it('should ignore sorting', () => {
                const mockWhereBuilder = ts_mockito_1.mock(query_1.WhereBuilder);
                expectSoftDeleteSQLSnapshot({
                    sorting: [
                        { field: 'stringType', direction: core_1.SortDirection.ASC },
                        { field: 'testEntityPk', direction: core_1.SortDirection.DESC },
                    ],
                }, ts_mockito_1.instance(mockWhereBuilder));
                ts_mockito_1.verify(mockWhereBuilder.build(ts_mockito_1.anything(), ts_mockito_1.anything(), ts_mockito_1.anything())).never();
            });
        });
    });
});
//# sourceMappingURL=filter-query.builder.spec.js.map