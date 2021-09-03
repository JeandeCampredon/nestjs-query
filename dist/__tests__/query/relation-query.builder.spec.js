"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs-query/core");
const connection_fixture_1 = require("../__fixtures__/connection.fixture");
const test_relation_entity_1 = require("../__fixtures__/test-relation.entity");
const test_entity_1 = require("../__fixtures__/test.entity");
const query_1 = require("../../src/query");
describe('RelationQueryBuilder', () => {
    beforeEach(connection_fixture_1.createTestConnection);
    afterEach(connection_fixture_1.closeTestConnection);
    const getRelationQueryBuilder = (EntityClass, relationName) => new query_1.RelationQueryBuilder(connection_fixture_1.getTestConnection().getRepository(EntityClass), relationName);
    const expectSQLSnapshot = (EntityClass, entity, relation, query) => {
        const selectQueryBuilder = getRelationQueryBuilder(EntityClass, relation).select(entity, query);
        const [sql, params] = selectQueryBuilder.getQueryAndParameters();
        expect(sql).toMatchSnapshot();
        expect(params).toMatchSnapshot();
    };
    describe('#select', () => {
        const testEntity = {
            testEntityPk: 'test-entity-id-1',
            dateType: new Date(),
            boolType: true,
            numberType: 1,
            stringType: 'str',
        };
        const testRelation = {
            testRelationPk: 'test-relation-id-1',
            relationName: 'relation-name',
        };
        it('should throw an error if there is no relation with that name', () => {
            expect(() => {
                expectSQLSnapshot(test_entity_1.TestEntity, testEntity, 'badRelations', {});
            }).toThrow("Unable to find entity for relation 'badRelations'");
        });
        describe('one to many', () => {
            it('should query with a single entity', () => {
                expectSQLSnapshot(test_entity_1.TestEntity, testEntity, 'testRelations', {});
            });
        });
        describe('many to one', () => {
            it('should work with one entity', () => {
                expectSQLSnapshot(test_relation_entity_1.TestRelation, testRelation, 'testEntity', {});
            });
            it('should work with a uni-directional relationship', () => {
                expectSQLSnapshot(test_relation_entity_1.TestRelation, testRelation, 'testEntityUniDirectional', {});
            });
        });
        describe('many to many', () => {
            describe('on owning side', () => {
                it('should work with one entity', () => {
                    expectSQLSnapshot(test_entity_1.TestEntity, testEntity, 'manyTestRelations', {});
                });
            });
            describe('on non owning side', () => {
                it('should work with many to many', () => {
                    expectSQLSnapshot(test_relation_entity_1.TestRelation, testRelation, 'manyTestEntities', {});
                });
            });
            describe('many-to-many custom join table', () => {
                it('should work with a many-to-many through a join table', () => {
                    expectSQLSnapshot(test_entity_1.TestEntity, testEntity, 'testEntityRelation', {});
                });
            });
            describe('uni-directional many to many', () => {
                it('should create the correct sql', () => {
                    expectSQLSnapshot(test_entity_1.TestEntity, testEntity, 'manyToManyUniDirectional', {});
                });
            });
        });
        describe('one to one', () => {
            it('on owning side', () => {
                expectSQLSnapshot(test_entity_1.TestEntity, testEntity, 'oneTestRelation', {});
            });
            it('on non owning side', () => {
                expectSQLSnapshot(test_relation_entity_1.TestRelation, testRelation, 'oneTestEntity', {});
            });
        });
        describe('with filter', () => {
            it('should call whereBuilder#build if there is a filter', () => {
                const query = { filter: { relationName: { eq: 'foo' } } };
                expectSQLSnapshot(test_entity_1.TestEntity, testEntity, 'testRelations', query);
            });
        });
        describe('with paging', () => {
            it('should apply paging args going forward', () => {
                expectSQLSnapshot(test_entity_1.TestEntity, testEntity, 'testRelations', { paging: { limit: 10, offset: 11 } });
            });
            it('should apply paging args going backward', () => {
                expectSQLSnapshot(test_entity_1.TestEntity, testEntity, 'testRelations', { paging: { limit: 10, offset: 10 } });
            });
        });
        describe('with sorting', () => {
            it('should apply ASC sorting', () => {
                expectSQLSnapshot(test_entity_1.TestEntity, testEntity, 'testRelations', {
                    sorting: [{ field: 'relationName', direction: core_1.SortDirection.ASC }],
                });
            });
            it('should apply ASC NULLS_FIRST sorting', () => {
                expectSQLSnapshot(test_entity_1.TestEntity, testEntity, 'testRelations', {
                    sorting: [{ field: 'relationName', direction: core_1.SortDirection.ASC, nulls: core_1.SortNulls.NULLS_FIRST }],
                });
            });
            it('should apply ASC NULLS_LAST sorting', () => {
                expectSQLSnapshot(test_entity_1.TestEntity, testEntity, 'testRelations', {
                    sorting: [{ field: 'relationName', direction: core_1.SortDirection.ASC, nulls: core_1.SortNulls.NULLS_LAST }],
                });
            });
            it('should apply DESC sorting', () => {
                expectSQLSnapshot(test_entity_1.TestEntity, testEntity, 'testRelations', {
                    sorting: [{ field: 'relationName', direction: core_1.SortDirection.DESC }],
                });
            });
            it('should apply DESC NULLS_FIRST sorting', () => {
                expectSQLSnapshot(test_entity_1.TestEntity, testEntity, 'testRelations', {
                    sorting: [{ field: 'relationName', direction: core_1.SortDirection.DESC, nulls: core_1.SortNulls.NULLS_FIRST }],
                });
            });
            it('should apply DESC NULLS_LAST sorting', () => {
                expectSQLSnapshot(test_entity_1.TestEntity, testEntity, 'testRelations', {
                    sorting: [{ field: 'relationName', direction: core_1.SortDirection.DESC, nulls: core_1.SortNulls.NULLS_LAST }],
                });
            });
            it('should apply multiple sorts', () => {
                expectSQLSnapshot(test_entity_1.TestEntity, testEntity, 'testRelations', {
                    sorting: [
                        { field: 'relationName', direction: core_1.SortDirection.ASC },
                        { field: 'testRelationPk', direction: core_1.SortDirection.DESC },
                    ],
                });
            });
        });
    });
});
//# sourceMappingURL=relation-query.builder.spec.js.map