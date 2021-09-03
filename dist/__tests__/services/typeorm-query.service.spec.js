"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@nestjs-query/core");
const testing_1 = require("@nestjs/testing");
const class_transformer_1 = require("class-transformer");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const src_1 = require("../../src");
const query_1 = require("../../src/query");
const connection_fixture_1 = require("../__fixtures__/connection.fixture");
const seeds_1 = require("../__fixtures__/seeds");
const test_entity_relation_entity_1 = require("../__fixtures__/test-entity-relation.entity");
const test_relation_entity_1 = require("../__fixtures__/test-relation.entity");
const test_soft_delete_entity_1 = require("../__fixtures__/test-soft-delete.entity");
const test_entity_1 = require("../__fixtures__/test.entity");
describe('TypeOrmQueryService', () => {
    let moduleRef;
    let TestEntityService = class TestEntityService extends src_1.TypeOrmQueryService {
        constructor(repo) {
            super(repo);
            this.repo = repo;
        }
    };
    TestEntityService = tslib_1.__decorate([
        tslib_1.__param(0, typeorm_2.InjectRepository(test_entity_1.TestEntity)),
        tslib_1.__metadata("design:paramtypes", [typeorm_1.Repository])
    ], TestEntityService);
    let TestRelationService = class TestRelationService extends src_1.TypeOrmQueryService {
        constructor(repo) {
            super(repo);
            this.repo = repo;
        }
    };
    TestRelationService = tslib_1.__decorate([
        tslib_1.__param(0, typeorm_2.InjectRepository(test_relation_entity_1.TestRelation)),
        tslib_1.__metadata("design:paramtypes", [typeorm_1.Repository])
    ], TestRelationService);
    let TestSoftDeleteEntityService = class TestSoftDeleteEntityService extends src_1.TypeOrmQueryService {
        constructor(repo) {
            super(repo, { useSoftDelete: true });
            this.repo = repo;
        }
    };
    TestSoftDeleteEntityService = tslib_1.__decorate([
        tslib_1.__param(0, typeorm_2.InjectRepository(test_soft_delete_entity_1.TestSoftDeleteEntity)),
        tslib_1.__metadata("design:paramtypes", [typeorm_1.Repository])
    ], TestSoftDeleteEntityService);
    afterEach(connection_fixture_1.closeTestConnection);
    beforeEach(async () => {
        moduleRef = await testing_1.Test.createTestingModule({
            imports: [
                typeorm_2.TypeOrmModule.forRoot(connection_fixture_1.CONNECTION_OPTIONS),
                typeorm_2.TypeOrmModule.forFeature([test_entity_1.TestEntity, test_relation_entity_1.TestRelation, test_entity_relation_entity_1.TestEntityRelationEntity, test_soft_delete_entity_1.TestSoftDeleteEntity]),
            ],
            providers: [TestEntityService, TestRelationService, TestSoftDeleteEntityService],
        }).compile();
        await connection_fixture_1.refresh();
    });
    it('should create a filterQueryBuilder and assemblerService based on the repo passed in if not provided', () => {
        const queryService = moduleRef.get(TestEntityService);
        expect(queryService.filterQueryBuilder).toBeInstanceOf(query_1.FilterQueryBuilder);
        expect(queryService.filterQueryBuilder.repo.target).toBe(test_entity_1.TestEntity);
    });
    describe('#query', () => {
        it('call select and return the result', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.query({ filter: { stringType: { eq: 'foo1' } } });
            return expect(queryResult).toEqual([seeds_1.TEST_ENTITIES[0]]);
        });
        describe('filter on relations', () => {
            describe('oneToOne', () => {
                it('should allow filtering on a one to one relation', async () => {
                    const entity = seeds_1.TEST_ENTITIES[0];
                    const queryService = moduleRef.get(TestEntityService);
                    const queryResult = await queryService.query({
                        filter: {
                            oneTestRelation: {
                                testRelationPk: {
                                    in: [`test-relations-${entity.testEntityPk}-1`, `test-relations-${entity.testEntityPk}-3`],
                                },
                            },
                        },
                    });
                    expect(queryResult).toEqual([entity]);
                });
                it('should allow filtering on a one to one relation with an OR clause', async () => {
                    const entity = seeds_1.TEST_ENTITIES[0];
                    const queryService = moduleRef.get(TestEntityService);
                    const queryResult = await queryService.query({
                        filter: {
                            or: [
                                { testEntityPk: { eq: seeds_1.TEST_ENTITIES[1].testEntityPk } },
                                {
                                    oneTestRelation: {
                                        testRelationPk: {
                                            in: [`test-relations-${entity.testEntityPk}-1`, `test-relations-${entity.testEntityPk}-3`],
                                        },
                                    },
                                },
                            ],
                        },
                        sorting: [{ field: 'testEntityPk', direction: core_1.SortDirection.ASC }],
                        paging: { limit: 2 },
                    });
                    expect(queryResult).toEqual([entity, seeds_1.TEST_ENTITIES[1]]);
                });
            });
            describe('manyToOne', () => {
                it('should allow filtering on a many to one relation', async () => {
                    const queryService = moduleRef.get(TestRelationService);
                    const queryResults = await queryService.query({
                        filter: {
                            testEntity: {
                                testEntityPk: {
                                    in: [seeds_1.TEST_ENTITIES[0].testEntityPk, seeds_1.TEST_ENTITIES[1].testEntityPk],
                                },
                            },
                        },
                    });
                    expect(queryResults).toEqual(seeds_1.TEST_RELATIONS.slice(0, 6));
                });
                it('should allow filtering on a uni directional many to one relation', async () => {
                    const queryService = moduleRef.get(TestRelationService);
                    const queryResults = await queryService.query({
                        filter: {
                            testEntityUniDirectional: {
                                testEntityPk: {
                                    in: [seeds_1.TEST_ENTITIES[0].testEntityPk, seeds_1.TEST_ENTITIES[1].testEntityPk],
                                },
                            },
                        },
                    });
                    expect(queryResults).toEqual(seeds_1.TEST_RELATIONS.slice(0, 6));
                });
                it('should allow filtering on a many to one relation with paging', async () => {
                    const queryService = moduleRef.get(TestRelationService);
                    const queryResults = await queryService.query({
                        filter: {
                            or: [
                                { testRelationPk: { eq: seeds_1.TEST_RELATIONS[6].testRelationPk } },
                                {
                                    testEntity: {
                                        testEntityPk: {
                                            in: [seeds_1.TEST_ENTITIES[0].testEntityPk, seeds_1.TEST_ENTITIES[1].testEntityPk],
                                        },
                                    },
                                },
                            ],
                        },
                        sorting: [{ field: 'testRelationPk', direction: core_1.SortDirection.ASC }],
                        paging: { limit: 3 },
                    });
                    expect(queryResults).toEqual(seeds_1.TEST_RELATIONS.slice(0, 3));
                });
            });
            describe('oneToMany', () => {
                it('should allow filtering on a many to one relation', async () => {
                    const entity = seeds_1.TEST_ENTITIES[0];
                    const queryService = moduleRef.get(TestEntityService);
                    const queryResult = await queryService.query({
                        filter: {
                            testRelations: {
                                relationName: {
                                    in: [seeds_1.TEST_RELATIONS[0].relationName, seeds_1.TEST_RELATIONS[1].relationName],
                                },
                            },
                        },
                    });
                    expect(queryResult).toEqual([entity]);
                });
                it('should allow filtering on a one to many relation with paging', async () => {
                    const entity = seeds_1.TEST_ENTITIES[0];
                    const queryService = moduleRef.get(TestEntityService);
                    const queryResult = await queryService.query({
                        filter: {
                            or: [
                                { testEntityPk: { eq: seeds_1.TEST_ENTITIES[1].testEntityPk } },
                                {
                                    testRelations: {
                                        testRelationPk: {
                                            in: [`test-relations-${entity.testEntityPk}-1`, `test-relations-${entity.testEntityPk}-3`],
                                        },
                                    },
                                },
                            ],
                        },
                        sorting: [{ field: 'testEntityPk', direction: core_1.SortDirection.ASC }],
                        paging: { limit: 2 },
                    });
                    expect(queryResult).toEqual([entity, seeds_1.TEST_ENTITIES[1]]);
                });
            });
            describe('manyToMany', () => {
                it('should allow filtering on a many to many relation', async () => {
                    const queryService = moduleRef.get(TestEntityService);
                    const queryResult = await queryService.query({
                        filter: {
                            manyTestRelations: {
                                relationName: {
                                    in: [seeds_1.TEST_RELATIONS[1].relationName, seeds_1.TEST_RELATIONS[4].relationName],
                                },
                            },
                        },
                    });
                    expect(queryResult).toEqual([
                        seeds_1.TEST_ENTITIES[1],
                        seeds_1.TEST_ENTITIES[3],
                        seeds_1.TEST_ENTITIES[5],
                        seeds_1.TEST_ENTITIES[7],
                        seeds_1.TEST_ENTITIES[9],
                    ]);
                });
                it('should allow filtering on a many to many uni-directional relation', async () => {
                    const queryService = moduleRef.get(TestEntityService);
                    const queryResult = await queryService.query({
                        filter: {
                            manyToManyUniDirectional: {
                                relationName: {
                                    in: [seeds_1.TEST_RELATIONS[2].relationName, seeds_1.TEST_RELATIONS[5].relationName],
                                },
                            },
                        },
                    });
                    expect(queryResult).toEqual([seeds_1.TEST_ENTITIES[2], seeds_1.TEST_ENTITIES[5], seeds_1.TEST_ENTITIES[8]]);
                });
                it('should allow filtering on a many to many relation with paging', async () => {
                    const queryService = moduleRef.get(TestEntityService);
                    const queryResult = await queryService.query({
                        filter: {
                            or: [
                                { testEntityPk: { eq: seeds_1.TEST_ENTITIES[2].testEntityPk } },
                                {
                                    manyTestRelations: {
                                        relationName: {
                                            in: [seeds_1.TEST_RELATIONS[1].relationName, seeds_1.TEST_RELATIONS[4].relationName],
                                        },
                                    },
                                },
                            ],
                        },
                        sorting: [{ field: 'numberType', direction: core_1.SortDirection.ASC }],
                        paging: { limit: 6 },
                    });
                    expect(queryResult).toEqual([
                        seeds_1.TEST_ENTITIES[1],
                        seeds_1.TEST_ENTITIES[2],
                        seeds_1.TEST_ENTITIES[3],
                        seeds_1.TEST_ENTITIES[5],
                        seeds_1.TEST_ENTITIES[7],
                        seeds_1.TEST_ENTITIES[9],
                    ]);
                });
            });
        });
    });
    describe('#aggregate', () => {
        it('call select with the aggregate columns and return the result', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.aggregate({}, {
                count: ['testEntityPk'],
                avg: ['numberType'],
                sum: ['numberType'],
                max: ['testEntityPk', 'dateType', 'numberType', 'stringType'],
                min: ['testEntityPk', 'dateType', 'numberType', 'stringType'],
            });
            return expect(queryResult).toEqual([
                {
                    avg: {
                        numberType: 5.5,
                    },
                    count: {
                        testEntityPk: 10,
                    },
                    max: {
                        dateType: expect.stringMatching('2020-02-10'),
                        numberType: 10,
                        stringType: 'foo9',
                        testEntityPk: 'test-entity-9',
                    },
                    min: {
                        dateType: expect.stringMatching('2020-02-01'),
                        numberType: 1,
                        stringType: 'foo1',
                        testEntityPk: 'test-entity-1',
                    },
                    sum: {
                        numberType: 55,
                    },
                },
            ]);
        });
        it('call aggregate with a group by', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.aggregate({}, {
                groupBy: ['boolType'],
                count: ['testEntityPk'],
                avg: ['numberType'],
                sum: ['numberType'],
                max: ['testEntityPk', 'dateType', 'numberType', 'stringType'],
                min: ['testEntityPk', 'dateType', 'numberType', 'stringType'],
            });
            return expect(queryResult).toEqual([
                {
                    groupBy: {
                        boolType: 0,
                    },
                    avg: {
                        numberType: 5,
                    },
                    count: {
                        testEntityPk: 5,
                    },
                    max: {
                        dateType: expect.stringMatching('2020-02-09'),
                        numberType: 9,
                        stringType: 'foo9',
                        testEntityPk: 'test-entity-9',
                    },
                    min: {
                        dateType: expect.stringMatching('2020-02-01'),
                        numberType: 1,
                        stringType: 'foo1',
                        testEntityPk: 'test-entity-1',
                    },
                    sum: {
                        numberType: 25,
                    },
                },
                {
                    groupBy: {
                        boolType: 1,
                    },
                    avg: {
                        numberType: 6,
                    },
                    count: {
                        testEntityPk: 5,
                    },
                    max: {
                        dateType: expect.stringMatching('2020-02-10'),
                        numberType: 10,
                        stringType: 'foo8',
                        testEntityPk: 'test-entity-8',
                    },
                    min: {
                        dateType: expect.stringMatching('2020-02-02'),
                        numberType: 2,
                        stringType: 'foo10',
                        testEntityPk: 'test-entity-10',
                    },
                    sum: {
                        numberType: 30,
                    },
                },
            ]);
        });
        it('call select with the aggregate columns and return the result with a filter', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.aggregate({ stringType: { in: ['foo1', 'foo2', 'foo3'] } }, {
                count: ['testEntityPk'],
                avg: ['numberType'],
                sum: ['numberType'],
                max: ['testEntityPk', 'dateType', 'numberType', 'stringType'],
                min: ['testEntityPk', 'dateType', 'numberType', 'stringType'],
            });
            return expect(queryResult).toEqual([
                {
                    avg: {
                        numberType: 2,
                    },
                    count: {
                        testEntityPk: 3,
                    },
                    max: {
                        dateType: expect.stringMatching('2020-02-03'),
                        numberType: 3,
                        stringType: 'foo3',
                        testEntityPk: 'test-entity-3',
                    },
                    min: {
                        dateType: expect.stringMatching('2020-02-01'),
                        numberType: 1,
                        stringType: 'foo1',
                        testEntityPk: 'test-entity-1',
                    },
                    sum: {
                        numberType: 6,
                    },
                },
            ]);
        });
        it('call aggregate with a group and filter', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.aggregate({ stringType: { in: ['foo1', 'foo2', 'foo3'] } }, {
                groupBy: ['boolType'],
                count: ['testEntityPk'],
                avg: ['numberType'],
                sum: ['numberType'],
                max: ['testEntityPk', 'dateType', 'numberType', 'stringType'],
                min: ['testEntityPk', 'dateType', 'numberType', 'stringType'],
            });
            return expect(queryResult).toEqual([
                {
                    groupBy: {
                        boolType: 0,
                    },
                    avg: {
                        numberType: 2,
                    },
                    count: {
                        testEntityPk: 2,
                    },
                    max: {
                        dateType: expect.stringMatching('2020-02-03'),
                        numberType: 3,
                        stringType: 'foo3',
                        testEntityPk: 'test-entity-3',
                    },
                    min: {
                        dateType: expect.stringMatching('2020-02-01'),
                        numberType: 1,
                        stringType: 'foo1',
                        testEntityPk: 'test-entity-1',
                    },
                    sum: {
                        numberType: 4,
                    },
                },
                {
                    groupBy: {
                        boolType: 1,
                    },
                    avg: {
                        numberType: 2,
                    },
                    count: {
                        testEntityPk: 1,
                    },
                    max: {
                        dateType: expect.stringMatching('2020-02-02'),
                        numberType: 2,
                        stringType: 'foo2',
                        testEntityPk: 'test-entity-2',
                    },
                    min: {
                        dateType: expect.stringMatching('2020-02-02'),
                        numberType: 2,
                        stringType: 'foo2',
                        testEntityPk: 'test-entity-2',
                    },
                    sum: {
                        numberType: 2,
                    },
                },
            ]);
        });
    });
    describe('#count', () => {
        it('call select and return the result', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.count({ stringType: { like: 'foo%' } });
            return expect(queryResult).toBe(10);
        });
        describe('with relations', () => {
            describe('oneToOne', () => {
                it('should properly count the number pf records with the associated relations', async () => {
                    const entity = seeds_1.TEST_ENTITIES[0];
                    const queryService = moduleRef.get(TestEntityService);
                    const count = await queryService.count({
                        oneTestRelation: {
                            testRelationPk: {
                                in: [`test-relations-${entity.testEntityPk}-1`, `test-relations-${entity.testEntityPk}-3`],
                            },
                        },
                    });
                    expect(count).toEqual(1);
                });
            });
            describe('manyToOne', () => {
                it('set the relation to null', async () => {
                    const queryService = moduleRef.get(TestRelationService);
                    const count = await queryService.count({
                        testEntity: {
                            testEntityPk: {
                                in: [seeds_1.TEST_ENTITIES[0].testEntityPk, seeds_1.TEST_ENTITIES[2].testEntityPk],
                            },
                        },
                    });
                    expect(count).toEqual(6);
                });
            });
            describe('oneToMany', () => {
                it('set the relation to null', async () => {
                    const relation = seeds_1.TEST_RELATIONS[0];
                    const queryService = moduleRef.get(TestEntityService);
                    const count = await queryService.count({
                        testRelations: {
                            testEntityId: {
                                in: [relation.testEntityId],
                            },
                        },
                    });
                    expect(count).toEqual(1);
                });
            });
        });
    });
    describe('#queryRelations', () => {
        describe('with one entity', () => {
            it('call select and return the result', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(test_relation_entity_1.TestRelation, 'testRelations', seeds_1.TEST_ENTITIES[0], {});
                return expect(queryResult.map((r) => r.testEntityId)).toEqual([
                    seeds_1.TEST_ENTITIES[0].testEntityPk,
                    seeds_1.TEST_ENTITIES[0].testEntityPk,
                    seeds_1.TEST_ENTITIES[0].testEntityPk,
                ]);
            });
            it('should apply a filter', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(test_relation_entity_1.TestRelation, 'testRelations', seeds_1.TEST_ENTITIES[0], {
                    filter: { testRelationPk: { notLike: '%-1' } },
                });
                return expect(queryResult.map((r) => r.testRelationPk)).toEqual([
                    seeds_1.TEST_RELATIONS[1].testRelationPk,
                    seeds_1.TEST_RELATIONS[2].testRelationPk,
                ]);
            });
            it('should apply a paging', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(test_relation_entity_1.TestRelation, 'testRelations', seeds_1.TEST_ENTITIES[0], {
                    paging: { limit: 2, offset: 1 },
                });
                return expect(queryResult.map((r) => r.testRelationPk)).toEqual([
                    seeds_1.TEST_RELATIONS[1].testRelationPk,
                    seeds_1.TEST_RELATIONS[2].testRelationPk,
                ]);
            });
            describe('manyToMany', () => {
                it('call select and return the with a uni-directional relation', async () => {
                    const entity = seeds_1.TEST_ENTITIES[2];
                    const queryService = moduleRef.get(TestEntityService);
                    const queryResult = await queryService.queryRelations(test_relation_entity_1.TestRelation, 'manyToManyUniDirectional', entity, {});
                    seeds_1.TEST_RELATIONS.filter((tr) => tr.relationName.endsWith('three')).forEach((tr) => {
                        expect(queryResult).toContainEqual(tr);
                    });
                });
            });
        });
        describe('with multiple entities', () => {
            it('call select and return the result', async () => {
                const entities = seeds_1.TEST_ENTITIES.slice(0, 3);
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(test_relation_entity_1.TestRelation, 'testRelations', entities, {});
                expect(queryResult.size).toBe(3);
                entities.forEach((e) => expect(queryResult.get(e)).toHaveLength(3));
            });
            it('should apply a filter', async () => {
                const entities = seeds_1.TEST_ENTITIES.slice(0, 3);
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(test_relation_entity_1.TestRelation, 'testRelations', entities, {
                    filter: { testRelationPk: { notLike: '%-1' } },
                });
                expect(queryResult.size).toBe(3);
                entities.forEach((e) => expect(queryResult.get(e)).toHaveLength(2));
            });
            it('should apply paging', async () => {
                const entities = seeds_1.TEST_ENTITIES.slice(0, 3);
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(test_relation_entity_1.TestRelation, 'testRelations', entities, {
                    paging: { limit: 2, offset: 1 },
                });
                expect(queryResult.size).toBe(3);
                entities.forEach((e) => expect(queryResult.get(e)).toHaveLength(2));
            });
            it('should return an empty array if no results are found.', async () => {
                const entities = [seeds_1.TEST_ENTITIES[0], { testEntityPk: 'does-not-exist' }];
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(test_relation_entity_1.TestRelation, 'testRelations', entities, {
                    filter: { relationName: { isNot: null } },
                });
                expect(queryResult.size).toBe(1);
                expect(queryResult.get(entities[0])).toHaveLength(3);
                expect(queryResult.get(entities[1])).toBeUndefined();
            });
        });
    });
    describe('#aggregateRelations', () => {
        describe('with one entity', () => {
            it('call select and return the result', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const aggResult = await queryService.aggregateRelations(test_relation_entity_1.TestRelation, 'testRelations', seeds_1.TEST_ENTITIES[0], {}, { count: ['testRelationPk'] });
                return expect(aggResult).toEqual([
                    {
                        count: {
                            testRelationPk: 3,
                        },
                    },
                ]);
            });
            it('should apply a filter', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const aggResult = await queryService.aggregateRelations(test_relation_entity_1.TestRelation, 'testRelations', seeds_1.TEST_ENTITIES[0], { testRelationPk: { notLike: '%-1' } }, { count: ['testRelationPk'] });
                return expect(aggResult).toEqual([
                    {
                        count: {
                            testRelationPk: 2,
                        },
                    },
                ]);
            });
        });
        describe('with multiple entities', () => {
            it('aggregate for each entities relation', async () => {
                const entities = seeds_1.TEST_ENTITIES.slice(0, 3);
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.aggregateRelations(test_relation_entity_1.TestRelation, 'testRelations', entities, {}, {
                    count: ['testRelationPk', 'relationName', 'testEntityId'],
                    min: ['testRelationPk', 'relationName', 'testEntityId'],
                    max: ['testRelationPk', 'relationName', 'testEntityId'],
                });
                expect(queryResult.size).toBe(3);
                expect(queryResult).toEqual(new Map([
                    [
                        entities[0],
                        [
                            {
                                count: {
                                    relationName: 3,
                                    testEntityId: 3,
                                    testRelationPk: 3,
                                },
                                max: {
                                    relationName: 'foo1-test-relation-two',
                                    testEntityId: 'test-entity-1',
                                    testRelationPk: 'test-relations-test-entity-1-3',
                                },
                                min: {
                                    relationName: 'foo1-test-relation-one',
                                    testEntityId: 'test-entity-1',
                                    testRelationPk: 'test-relations-test-entity-1-1',
                                },
                            },
                        ],
                    ],
                    [
                        entities[1],
                        [
                            {
                                count: {
                                    relationName: 3,
                                    testEntityId: 3,
                                    testRelationPk: 3,
                                },
                                max: {
                                    relationName: 'foo2-test-relation-two',
                                    testEntityId: 'test-entity-2',
                                    testRelationPk: 'test-relations-test-entity-2-3',
                                },
                                min: {
                                    relationName: 'foo2-test-relation-one',
                                    testEntityId: 'test-entity-2',
                                    testRelationPk: 'test-relations-test-entity-2-1',
                                },
                            },
                        ],
                    ],
                    [
                        entities[2],
                        [
                            {
                                count: {
                                    relationName: 3,
                                    testEntityId: 3,
                                    testRelationPk: 3,
                                },
                                max: {
                                    relationName: 'foo3-test-relation-two',
                                    testEntityId: 'test-entity-3',
                                    testRelationPk: 'test-relations-test-entity-3-3',
                                },
                                min: {
                                    relationName: 'foo3-test-relation-one',
                                    testEntityId: 'test-entity-3',
                                    testRelationPk: 'test-relations-test-entity-3-1',
                                },
                            },
                        ],
                    ],
                ]));
            });
            it('aggregate and group for each entities relation', async () => {
                const entities = seeds_1.TEST_ENTITIES.slice(0, 3);
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.aggregateRelations(test_relation_entity_1.TestRelation, 'testRelations', entities, {}, {
                    groupBy: ['testEntityId'],
                    count: ['testRelationPk', 'relationName', 'testEntityId'],
                    min: ['testRelationPk', 'relationName', 'testEntityId'],
                    max: ['testRelationPk', 'relationName', 'testEntityId'],
                });
                expect(queryResult.size).toBe(3);
                expect(queryResult).toEqual(new Map([
                    [
                        entities[0],
                        [
                            {
                                groupBy: {
                                    testEntityId: 'test-entity-1',
                                },
                                count: {
                                    relationName: 3,
                                    testEntityId: 3,
                                    testRelationPk: 3,
                                },
                                max: {
                                    relationName: 'foo1-test-relation-two',
                                    testEntityId: 'test-entity-1',
                                    testRelationPk: 'test-relations-test-entity-1-3',
                                },
                                min: {
                                    relationName: 'foo1-test-relation-one',
                                    testEntityId: 'test-entity-1',
                                    testRelationPk: 'test-relations-test-entity-1-1',
                                },
                            },
                        ],
                    ],
                    [
                        entities[1],
                        [
                            {
                                groupBy: {
                                    testEntityId: 'test-entity-2',
                                },
                                count: {
                                    relationName: 3,
                                    testEntityId: 3,
                                    testRelationPk: 3,
                                },
                                max: {
                                    relationName: 'foo2-test-relation-two',
                                    testEntityId: 'test-entity-2',
                                    testRelationPk: 'test-relations-test-entity-2-3',
                                },
                                min: {
                                    relationName: 'foo2-test-relation-one',
                                    testEntityId: 'test-entity-2',
                                    testRelationPk: 'test-relations-test-entity-2-1',
                                },
                            },
                        ],
                    ],
                    [
                        entities[2],
                        [
                            {
                                groupBy: {
                                    testEntityId: 'test-entity-3',
                                },
                                count: {
                                    relationName: 3,
                                    testEntityId: 3,
                                    testRelationPk: 3,
                                },
                                max: {
                                    relationName: 'foo3-test-relation-two',
                                    testEntityId: 'test-entity-3',
                                    testRelationPk: 'test-relations-test-entity-3-3',
                                },
                                min: {
                                    relationName: 'foo3-test-relation-one',
                                    testEntityId: 'test-entity-3',
                                    testRelationPk: 'test-relations-test-entity-3-1',
                                },
                            },
                        ],
                    ],
                ]));
            });
            it('should apply a filter', async () => {
                const entities = seeds_1.TEST_ENTITIES.slice(0, 3);
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.aggregateRelations(test_relation_entity_1.TestRelation, 'testRelations', entities, { testRelationPk: { notLike: '%-1' } }, {
                    count: ['testRelationPk', 'relationName', 'testEntityId'],
                    min: ['testRelationPk', 'relationName', 'testEntityId'],
                    max: ['testRelationPk', 'relationName', 'testEntityId'],
                });
                expect(queryResult.size).toBe(3);
                expect(queryResult).toEqual(new Map([
                    [
                        entities[0],
                        [
                            {
                                count: {
                                    relationName: 2,
                                    testEntityId: 2,
                                    testRelationPk: 2,
                                },
                                max: {
                                    relationName: 'foo1-test-relation-two',
                                    testEntityId: 'test-entity-1',
                                    testRelationPk: 'test-relations-test-entity-1-3',
                                },
                                min: {
                                    relationName: 'foo1-test-relation-three',
                                    testEntityId: 'test-entity-1',
                                    testRelationPk: 'test-relations-test-entity-1-2',
                                },
                            },
                        ],
                    ],
                    [
                        entities[1],
                        [
                            {
                                count: {
                                    relationName: 2,
                                    testEntityId: 2,
                                    testRelationPk: 2,
                                },
                                max: {
                                    relationName: 'foo2-test-relation-two',
                                    testEntityId: 'test-entity-2',
                                    testRelationPk: 'test-relations-test-entity-2-3',
                                },
                                min: {
                                    relationName: 'foo2-test-relation-three',
                                    testEntityId: 'test-entity-2',
                                    testRelationPk: 'test-relations-test-entity-2-2',
                                },
                            },
                        ],
                    ],
                    [
                        entities[2],
                        [
                            {
                                count: {
                                    relationName: 2,
                                    testEntityId: 2,
                                    testRelationPk: 2,
                                },
                                max: {
                                    relationName: 'foo3-test-relation-two',
                                    testEntityId: 'test-entity-3',
                                    testRelationPk: 'test-relations-test-entity-3-3',
                                },
                                min: {
                                    relationName: 'foo3-test-relation-three',
                                    testEntityId: 'test-entity-3',
                                    testRelationPk: 'test-relations-test-entity-3-2',
                                },
                            },
                        ],
                    ],
                ]));
            });
            it('should return an empty array if no results are found.', async () => {
                const entities = [seeds_1.TEST_ENTITIES[0], { testEntityPk: 'does-not-exist' }];
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.aggregateRelations(test_relation_entity_1.TestRelation, 'testRelations', entities, { relationName: { isNot: null } }, {
                    count: ['testRelationPk', 'relationName', 'testEntityId'],
                    min: ['testRelationPk', 'relationName', 'testEntityId'],
                    max: ['testRelationPk', 'relationName', 'testEntityId'],
                });
                expect(queryResult).toEqual(new Map([
                    [
                        entities[0],
                        [
                            {
                                count: {
                                    relationName: 3,
                                    testEntityId: 3,
                                    testRelationPk: 3,
                                },
                                max: {
                                    relationName: 'foo1-test-relation-two',
                                    testEntityId: 'test-entity-1',
                                    testRelationPk: 'test-relations-test-entity-1-3',
                                },
                                min: {
                                    relationName: 'foo1-test-relation-one',
                                    testEntityId: 'test-entity-1',
                                    testRelationPk: 'test-relations-test-entity-1-1',
                                },
                            },
                        ],
                    ],
                    [
                        { testEntityPk: 'does-not-exist' },
                        [
                            {
                                count: {
                                    relationName: 0,
                                    testEntityId: 0,
                                    testRelationPk: 0,
                                },
                                max: {
                                    relationName: null,
                                    testEntityId: null,
                                    testRelationPk: null,
                                },
                                min: {
                                    relationName: null,
                                    testEntityId: null,
                                    testRelationPk: null,
                                },
                            },
                        ],
                    ],
                ]));
            });
        });
    });
    describe('#countRelations', () => {
        describe('with one entity', () => {
            it('call count and return the result', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const countResult = await queryService.countRelations(test_relation_entity_1.TestRelation, 'testRelations', seeds_1.TEST_ENTITIES[0], {
                    relationName: { isNot: null },
                });
                return expect(countResult).toEqual(3);
            });
        });
        describe('with multiple entities', () => {
            it('call count and return the result', async () => {
                const entities = seeds_1.TEST_ENTITIES.slice(0, 3);
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.countRelations(test_relation_entity_1.TestRelation, 'testRelations', entities, {
                    relationName: { isNot: null },
                });
                expect(queryResult).toEqual(new Map([
                    [entities[0], 3],
                    [entities[1], 3],
                    [entities[2], 3],
                ]));
            });
        });
    });
    describe('#findRelation', () => {
        describe('with one entity', () => {
            it('call select and return the result', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.findRelation(test_relation_entity_1.TestRelation, 'oneTestRelation', entity);
                expect(queryResult).toEqual(seeds_1.TEST_RELATIONS[0]);
            });
            it('apply the filter option', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                const queryResult1 = await queryService.findRelation(test_relation_entity_1.TestRelation, 'oneTestRelation', entity, {
                    filter: { relationName: { eq: seeds_1.TEST_RELATIONS[0].relationName } },
                });
                expect(queryResult1).toEqual(seeds_1.TEST_RELATIONS[0]);
                const queryResult2 = await queryService.findRelation(test_relation_entity_1.TestRelation, 'oneTestRelation', entity, {
                    filter: { relationName: { eq: seeds_1.TEST_RELATIONS[1].relationName } },
                });
                expect(queryResult2).toBeUndefined();
            });
            it('should return undefined select if no results are found.', async () => {
                const entity = { ...seeds_1.TEST_ENTITIES[0], testEntityPk: 'not-real' };
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.findRelation(test_relation_entity_1.TestRelation, 'oneTestRelation', entity);
                expect(queryResult).toBeUndefined();
            });
            it('throw an error if a relation with that name is not found.', async () => {
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.findRelation(test_relation_entity_1.TestRelation, 'badRelation', seeds_1.TEST_ENTITIES[0])).rejects.toThrow('Unable to find relation badRelation on TestEntity');
            });
            describe('manyToOne', () => {
                it('call select and return the with a uni-directional relation', async () => {
                    const entity = seeds_1.TEST_RELATIONS[0];
                    const queryService = moduleRef.get(TestRelationService);
                    const queryResult = await queryService.findRelation(test_entity_1.TestEntity, 'testEntityUniDirectional', entity);
                    expect(queryResult).toEqual(seeds_1.TEST_ENTITIES[0]);
                });
            });
        });
        describe('with multiple entities', () => {
            it('call select and return the result', async () => {
                const entities = seeds_1.TEST_ENTITIES.slice(0, 3);
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.findRelation(test_relation_entity_1.TestRelation, 'oneTestRelation', entities);
                expect(queryResult).toEqual(new Map([
                    [entities[0], seeds_1.TEST_RELATIONS[0]],
                    [entities[1], seeds_1.TEST_RELATIONS[3]],
                    [entities[2], seeds_1.TEST_RELATIONS[6]],
                ]));
            });
            it('should apply the filter option', async () => {
                const entities = seeds_1.TEST_ENTITIES.slice(0, 3);
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.findRelation(test_relation_entity_1.TestRelation, 'oneTestRelation', entities, {
                    filter: { testRelationPk: { in: [seeds_1.TEST_RELATIONS[0].testRelationPk, seeds_1.TEST_RELATIONS[6].testRelationPk] } },
                });
                expect(queryResult).toEqual(new Map([
                    [entities[0], seeds_1.TEST_RELATIONS[0]],
                    [entities[2], seeds_1.TEST_RELATIONS[6]],
                ]));
            });
            it('should return undefined select if no results are found.', async () => {
                const entities = [seeds_1.TEST_ENTITIES[0], { testEntityPk: 'does-not-exist' }];
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.findRelation(test_relation_entity_1.TestRelation, 'oneTestRelation', entities);
                expect(queryResult).toEqual(new Map([[entities[0], seeds_1.TEST_RELATIONS[0]]]));
            });
        });
    });
    describe('#addRelations', () => {
        it('call select and return the result', async () => {
            const entity = seeds_1.TEST_ENTITIES[0];
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.addRelations('testRelations', entity.testEntityPk, seeds_1.TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk));
            expect(queryResult).toEqual(entity);
            const relations = await queryService.queryRelations(test_relation_entity_1.TestRelation, 'testRelations', entity, {});
            expect(relations).toHaveLength(6);
        });
        it('should not modify if the relationIds is empty', async () => {
            const entity = seeds_1.TEST_ENTITIES[0];
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.addRelations('testRelations', entity.testEntityPk, []);
            expect(queryResult).toEqual(entity);
            const relations = await queryService.queryRelations(test_relation_entity_1.TestRelation, 'testRelations', entity, {});
            expect(relations).toHaveLength(3);
        });
        describe('with modify options', () => {
            it('should throw an error if the entity is not found with the id and provided filter', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.addRelations('testRelations', entity.testEntityPk, seeds_1.TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk), {
                    filter: { stringType: { eq: seeds_1.TEST_ENTITIES[1].stringType } },
                })).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
            });
            it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.addRelations('testRelations', entity.testEntityPk, seeds_1.TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk), {
                    relationFilter: { relationName: { like: '%-one' } },
                })).rejects.toThrow('Unable to find all testRelations to add to TestEntity');
            });
        });
    });
    describe('#setRelations', () => {
        it('set all relations on the entity', async () => {
            const entity = seeds_1.TEST_ENTITIES[0];
            const queryService = moduleRef.get(TestEntityService);
            const relationIds = seeds_1.TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk);
            const queryResult = await queryService.setRelations('testRelations', entity.testEntityPk, relationIds);
            expect(queryResult).toEqual(entity);
            const relations = await queryService.queryRelations(test_relation_entity_1.TestRelation, 'testRelations', entity, {});
            expect(relations.map((r) => r.testRelationPk)).toEqual(relationIds);
        });
        it('should remove all relations if the relationIds is empty', async () => {
            const entity = seeds_1.TEST_ENTITIES[0];
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.setRelations('testRelations', entity.testEntityPk, []);
            expect(queryResult).toEqual(entity);
            const relations = await queryService.queryRelations(test_relation_entity_1.TestRelation, 'testRelations', entity, {});
            expect(relations.map((r) => r.testRelationPk)).toEqual([]);
        });
        describe('with modify options', () => {
            it('should throw an error if the entity is not found with the id and provided filter', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.setRelations('testRelations', entity.testEntityPk, seeds_1.TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk), {
                    filter: { stringType: { eq: seeds_1.TEST_ENTITIES[1].stringType } },
                })).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
            });
            it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.setRelations('testRelations', entity.testEntityPk, seeds_1.TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk), {
                    relationFilter: { relationName: { like: '%-one' } },
                })).rejects.toThrow('Unable to find all testRelations to set on TestEntity');
            });
        });
    });
    describe('#setRelation', () => {
        it('call select and return the result', async () => {
            const entity = seeds_1.TEST_ENTITIES[0];
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.setRelation('oneTestRelation', entity.testEntityPk, seeds_1.TEST_RELATIONS[1].testRelationPk);
            expect(queryResult).toEqual(entity);
            const relation = await queryService.findRelation(test_relation_entity_1.TestRelation, 'oneTestRelation', entity);
            expect(relation === null || relation === void 0 ? void 0 : relation.testRelationPk).toBe(seeds_1.TEST_RELATIONS[1].testRelationPk);
        });
        describe('with modify options', () => {
            it('should throw an error if the entity is not found with the id and provided filter', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.setRelation('oneTestRelation', entity.testEntityPk, seeds_1.TEST_RELATIONS[1].testRelationPk, {
                    filter: { stringType: { eq: seeds_1.TEST_ENTITIES[1].stringType } },
                })).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
            });
            it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.setRelation('oneTestRelation', entity.testEntityPk, seeds_1.TEST_RELATIONS[1].testRelationPk, {
                    relationFilter: { relationName: { like: '%-one' } },
                })).rejects.toThrow('Unable to find oneTestRelation to set on TestEntity');
            });
        });
    });
    describe('#removeRelations', () => {
        it('call select and return the result', async () => {
            const entity = seeds_1.TEST_ENTITIES[0];
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.removeRelations('testRelations', entity.testEntityPk, seeds_1.TEST_RELATIONS.slice(0, 3).map((r) => r.testRelationPk));
            expect(queryResult).toEqual(entity);
            const relations = await queryService.queryRelations(test_relation_entity_1.TestRelation, 'testRelations', entity, {});
            expect(relations).toHaveLength(0);
        });
        it('should not remove any relations if relationIds is empty', async () => {
            const entity = seeds_1.TEST_ENTITIES[0];
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.removeRelations('testRelations', entity.testEntityPk, []);
            expect(queryResult).toEqual(entity);
            const relations = await queryService.queryRelations(test_relation_entity_1.TestRelation, 'testRelations', entity, {});
            expect(relations).toHaveLength(3);
        });
        describe('with modify options', () => {
            it('should throw an error if the entity is not found with the id and provided filter', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.removeRelations('testRelations', entity.testEntityPk, seeds_1.TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk), {
                    filter: { stringType: { eq: seeds_1.TEST_ENTITIES[1].stringType } },
                })).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
            });
            it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.removeRelations('testRelations', entity.testEntityPk, seeds_1.TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk), {
                    relationFilter: { relationName: { like: '%-one' } },
                })).rejects.toThrow('Unable to find all testRelations to remove from TestEntity');
            });
        });
    });
    describe('#removeRelation', () => {
        describe('oneToOne', () => {
            it('set the relation to null', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.removeRelation('oneTestRelation', entity.testEntityPk, seeds_1.TEST_RELATIONS[0].testRelationPk);
                expect(queryResult).toEqual(entity);
                const relation = await queryService.findRelation(test_relation_entity_1.TestRelation, 'oneTestRelation', entity);
                expect(relation).toBeUndefined();
            });
            describe('with modify options', () => {
                it('should throw an error if the entity is not found with the id and provided filter', async () => {
                    const entity = seeds_1.TEST_ENTITIES[0];
                    const queryService = moduleRef.get(TestEntityService);
                    return expect(queryService.removeRelation('oneTestRelation', entity.testEntityPk, seeds_1.TEST_RELATIONS[1].testRelationPk, {
                        filter: { stringType: { eq: seeds_1.TEST_ENTITIES[1].stringType } },
                    })).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
                });
                it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
                    const entity = seeds_1.TEST_ENTITIES[0];
                    const queryService = moduleRef.get(TestEntityService);
                    return expect(queryService.removeRelation('oneTestRelation', entity.testEntityPk, seeds_1.TEST_RELATIONS[1].testRelationPk, {
                        relationFilter: { relationName: { like: '%-one' } },
                    })).rejects.toThrow('Unable to find oneTestRelation to remove from TestEntity');
                });
            });
        });
        describe('manyToOne', () => {
            it('set the relation to null', async () => {
                const relation = seeds_1.TEST_RELATIONS[0];
                const queryService = moduleRef.get(TestRelationService);
                const queryResult = await queryService.removeRelation('testEntity', relation.testRelationPk, seeds_1.TEST_ENTITIES[0].testEntityPk);
                expect(queryResult).toEqual(relation);
                const entity = await queryService.findRelation(test_entity_1.TestEntity, 'testEntity', relation);
                expect(entity).toBeUndefined();
            });
            describe('with modify options', () => {
                it('should throw an error if the entity is not found with the id and provided filter', async () => {
                    const relation = seeds_1.TEST_RELATIONS[0];
                    const queryService = moduleRef.get(TestRelationService);
                    return expect(queryService.removeRelation('testEntity', relation.testRelationPk, seeds_1.TEST_ENTITIES[1].testEntityPk, {
                        filter: { relationName: { eq: seeds_1.TEST_RELATIONS[1].relationName } },
                    })).rejects.toThrow('Unable to find TestRelation with id: test-relations-test-entity-1-1');
                });
                it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
                    const relation = seeds_1.TEST_RELATIONS[0];
                    const queryService = moduleRef.get(TestRelationService);
                    return expect(queryService.removeRelation('testEntity', relation.testRelationPk, seeds_1.TEST_ENTITIES[0].testEntityPk, {
                        relationFilter: { stringType: { eq: seeds_1.TEST_ENTITIES[1].stringType } },
                    })).rejects.toThrow('Unable to find testEntity to remove from TestRelation');
                });
            });
        });
        describe('oneToMany', () => {
            it('set the relation to null', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.removeRelation('testRelations', entity.testEntityPk, seeds_1.TEST_RELATIONS[0].testRelationPk);
                expect(queryResult).toEqual(entity);
                const relations = await queryService.queryRelations(test_relation_entity_1.TestRelation, 'testRelations', entity, {});
                expect(relations).toHaveLength(2);
            });
            describe('with modify options', () => {
                it('should throw an error if the entity is not found with the id and provided filter', async () => {
                    const entity = seeds_1.TEST_ENTITIES[0];
                    const queryService = moduleRef.get(TestEntityService);
                    return expect(queryService.removeRelation('testRelations', entity.testEntityPk, seeds_1.TEST_RELATIONS[4].testRelationPk, {
                        filter: { stringType: { eq: seeds_1.TEST_ENTITIES[1].stringType } },
                    })).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
                });
                it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
                    const entity = seeds_1.TEST_ENTITIES[0];
                    const queryService = moduleRef.get(TestEntityService);
                    return expect(queryService.removeRelation('testRelations', entity.testEntityPk, seeds_1.TEST_RELATIONS[4].testRelationPk, {
                        relationFilter: { relationName: { like: '%-one' } },
                    })).rejects.toThrow('Unable to find testRelations to remove from TestEntity');
                });
            });
        });
    });
    describe('#findById', () => {
        it('return the entity if found', async () => {
            const entity = seeds_1.TEST_ENTITIES[0];
            const queryService = moduleRef.get(TestEntityService);
            const found = await queryService.findById(entity.testEntityPk);
            expect(found).toEqual(entity);
        });
        it('return undefined if not found', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const found = await queryService.findById('bad-id');
            expect(found).toBeUndefined();
        });
        describe('with filter', () => {
            it('should return an entity if all filters match', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                const found = await queryService.findById(entity.testEntityPk, {
                    filter: { stringType: { eq: entity.stringType } },
                });
                expect(found).toEqual(entity);
            });
            it('should return an undefined if an entitity with the pk and filter is not found', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                const found = await queryService.findById(entity.testEntityPk, {
                    filter: { stringType: { eq: seeds_1.TEST_ENTITIES[1].stringType } },
                });
                expect(found).toBeUndefined();
            });
        });
    });
    describe('#getById', () => {
        it('return the entity if found', async () => {
            const entity = seeds_1.TEST_ENTITIES[0];
            const queryService = moduleRef.get(TestEntityService);
            const found = await queryService.getById(entity.testEntityPk);
            expect(found).toEqual(entity);
        });
        it('should throw an error if not found', () => {
            const queryService = moduleRef.get(TestEntityService);
            return expect(queryService.getById('bad-id')).rejects.toThrow('Unable to find TestEntity with id: bad-id');
        });
        describe('with filter', () => {
            it('should return an entity if all filters match', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                const found = await queryService.getById(entity.testEntityPk, {
                    filter: { stringType: { eq: entity.stringType } },
                });
                expect(found).toEqual(entity);
            });
            it('should return an undefined if an entitity with the pk and filter is not found', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.getById(entity.testEntityPk, {
                    filter: { stringType: { eq: seeds_1.TEST_ENTITIES[1].stringType } },
                })).rejects.toThrow(`Unable to find TestEntity with id: ${entity.testEntityPk}`);
            });
        });
    });
    describe('#createMany', () => {
        it('call save on the repo with instances of entities when passed plain objects', async () => {
            await connection_fixture_1.truncate(connection_fixture_1.getTestConnection());
            const queryService = moduleRef.get(TestEntityService);
            const created = await queryService.createMany(seeds_1.TEST_ENTITIES);
            expect(created).toEqual(seeds_1.TEST_ENTITIES);
        });
        it('call save on the repo with instances of entities when passed instances', async () => {
            await connection_fixture_1.truncate(connection_fixture_1.getTestConnection());
            const instances = seeds_1.TEST_ENTITIES.map((e) => class_transformer_1.plainToClass(test_entity_1.TestEntity, e));
            const queryService = moduleRef.get(TestEntityService);
            const created = await queryService.createMany(instances);
            expect(created).toEqual(instances);
        });
        it('should reject if the entities already exist', async () => {
            const queryService = moduleRef.get(TestEntityService);
            return expect(queryService.createMany(seeds_1.TEST_ENTITIES)).rejects.toThrow('Entity already exists');
        });
    });
    describe('#createOne', () => {
        it('call save on the repo with an instance of the entity when passed a plain object', async () => {
            await connection_fixture_1.truncate(connection_fixture_1.getTestConnection());
            const entity = seeds_1.TEST_ENTITIES[0];
            const queryService = moduleRef.get(TestEntityService);
            const created = await queryService.createOne(entity);
            expect(created).toEqual(entity);
        });
        it('call save on the repo with an instance of the entity when passed an instance', async () => {
            await connection_fixture_1.truncate(connection_fixture_1.getTestConnection());
            const entity = class_transformer_1.plainToClass(test_entity_1.TestEntity, seeds_1.TEST_ENTITIES[0]);
            const queryService = moduleRef.get(TestEntityService);
            const created = await queryService.createOne(entity);
            expect(created).toEqual(entity);
        });
        it('should reject if the entity contains an id', async () => {
            const entity = seeds_1.TEST_ENTITIES[0];
            const queryService = moduleRef.get(TestEntityService);
            return expect(queryService.createOne(entity)).rejects.toThrow('Entity already exists');
        });
    });
    describe('#deleteMany', () => {
        it('delete all records that match the query', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const { deletedCount } = await queryService.deleteMany({
                testEntityPk: { in: seeds_1.TEST_ENTITIES.slice(0, 5).map((e) => e.testEntityPk) },
            });
            expect(deletedCount).toEqual(expect.any(Number));
            const allCount = await queryService.count({});
            expect(allCount).toBe(5);
        });
    });
    describe('#deleteOne', () => {
        it('remove the entity', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const deleted = await queryService.deleteOne(seeds_1.TEST_ENTITIES[0].testEntityPk);
            expect(deleted).toEqual({ ...seeds_1.TEST_ENTITIES[0], testEntityPk: undefined });
        });
        it('call fail if the entity is not found', async () => {
            const queryService = moduleRef.get(TestEntityService);
            return expect(queryService.deleteOne('bad-id')).rejects.toThrow('Unable to find TestEntity with id: bad-id');
        });
        describe('with filter', () => {
            it('should delete the entity if all filters match', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                const deleted = await queryService.deleteOne(entity.testEntityPk, {
                    filter: { stringType: { eq: entity.stringType } },
                });
                expect(deleted).toEqual({ ...seeds_1.TEST_ENTITIES[0], testEntityPk: undefined });
            });
            it('should return throw an error if unable to find', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.deleteOne(entity.testEntityPk, {
                    filter: { stringType: { eq: seeds_1.TEST_ENTITIES[1].stringType } },
                })).rejects.toThrow(`Unable to find TestEntity with id: ${entity.testEntityPk}`);
            });
        });
    });
    describe('#updateMany', () => {
        it('update all entities in the filter', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const filter = {
                testEntityPk: { in: seeds_1.TEST_ENTITIES.slice(0, 5).map((e) => e.testEntityPk) },
            };
            await queryService.updateMany({ stringType: 'updated' }, filter);
            const entities = await queryService.query({ filter });
            expect(entities).toHaveLength(5);
            entities.forEach((e) => expect(e.stringType).toBe('updated'));
        });
        it('should reject if the update contains a primary key', () => {
            const queryService = moduleRef.get(TestEntityService);
            return expect(queryService.updateMany({ testEntityPk: 'updated' }, {})).rejects.toThrow('Id cannot be specified when updating');
        });
    });
    describe('#updateOne', () => {
        it('update the entity', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const updated = await queryService.updateOne(seeds_1.TEST_ENTITIES[0].testEntityPk, { stringType: 'updated' });
            expect(updated).toEqual({ ...seeds_1.TEST_ENTITIES[0], stringType: 'updated' });
        });
        it('should reject if the update contains a primary key', async () => {
            const queryService = moduleRef.get(TestEntityService);
            return expect(queryService.updateOne(seeds_1.TEST_ENTITIES[0].testEntityPk, { testEntityPk: 'bad-id' })).rejects.toThrow('Id cannot be specified when updating');
        });
        it('call fail if the entity is not found', async () => {
            const queryService = moduleRef.get(TestEntityService);
            return expect(queryService.updateOne('bad-id', { stringType: 'updated' })).rejects.toThrow('Unable to find TestEntity with id: bad-id');
        });
        describe('with filter', () => {
            it('should update the entity if all filters match', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                const updated = await queryService.updateOne(entity.testEntityPk, { stringType: 'updated' }, { filter: { stringType: { eq: entity.stringType } } });
                expect(updated).toEqual({ ...entity, stringType: 'updated' });
            });
            it('should throw an error if unable to find the entity', async () => {
                const entity = seeds_1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.updateOne(entity.testEntityPk, { stringType: 'updated' }, { filter: { stringType: { eq: seeds_1.TEST_ENTITIES[1].stringType } } })).rejects.toThrow(`Unable to find TestEntity with id: ${entity.testEntityPk}`);
            });
        });
    });
    describe('#isSoftDelete', () => {
        describe('#deleteMany', () => {
            it('should soft delete the entities matching the query', async () => {
                const queryService = moduleRef.get(TestSoftDeleteEntityService);
                const entity = seeds_1.TEST_SOFT_DELETE_ENTITIES[0];
                const deleteMany = { testEntityPk: { eq: entity.testEntityPk } };
                await queryService.deleteMany(deleteMany);
                const foundEntity = await queryService.findById(entity.testEntityPk);
                expect(foundEntity).toBeUndefined();
                const deletedEntity = await queryService.repo.findOne(entity.testEntityPk, { withDeleted: true });
                expect(deletedEntity).toEqual({ ...entity, deletedAt: expect.any(Date) });
            });
        });
        describe('#deleteOne', () => {
            it('should soft delete the entity', async () => {
                const queryService = moduleRef.get(TestSoftDeleteEntityService);
                const entity = seeds_1.TEST_SOFT_DELETE_ENTITIES[0];
                const deleted = await queryService.deleteOne(entity.testEntityPk);
                expect(deleted).toEqual({ ...entity, deletedAt: null });
                const foundEntity = await queryService.findById(entity.testEntityPk);
                expect(foundEntity).toBeUndefined();
                const deletedEntity = await queryService.repo.findOne(entity.testEntityPk, { withDeleted: true });
                expect(deletedEntity).toEqual({ ...entity, deletedAt: expect.any(Date) });
            });
            it('should fail if the entity is not found', async () => {
                const queryService = moduleRef.get(TestSoftDeleteEntityService);
                return expect(queryService.deleteOne('bad-id')).rejects.toThrow('Unable to find TestSoftDeleteEntity with id: bad-id');
            });
        });
        describe('#restoreOne', () => {
            it('restore the entity', async () => {
                const queryService = moduleRef.get(TestSoftDeleteEntityService);
                const entity = seeds_1.TEST_SOFT_DELETE_ENTITIES[0];
                await queryService.deleteOne(entity.testEntityPk);
                const restored = await queryService.restoreOne(entity.testEntityPk);
                expect(restored).toEqual({ ...entity, deletedAt: null });
                const foundEntity = await queryService.findById(entity.testEntityPk);
                expect(foundEntity).toEqual({ ...entity, deletedAt: null });
            });
            it('should fail if the entity is not found', async () => {
                const queryService = moduleRef.get(TestSoftDeleteEntityService);
                return expect(queryService.restoreOne('bad-id')).rejects.toThrow('Unable to find TestSoftDeleteEntity with id: bad-id');
            });
            it('should fail if the useSoftDelete is not enabled', async () => {
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.restoreOne(seeds_1.TEST_ENTITIES[0].testEntityPk)).rejects.toThrow('Restore not allowed for non soft deleted entity TestEntity.');
            });
            describe('with filter', () => {
                it('should restore the entity if all filters match', async () => {
                    const queryService = moduleRef.get(TestSoftDeleteEntityService);
                    const entity = seeds_1.TEST_SOFT_DELETE_ENTITIES[0];
                    await queryService.deleteOne(entity.testEntityPk);
                    const restored = await queryService.restoreOne(entity.testEntityPk, {
                        filter: { stringType: { eq: entity.stringType } },
                    });
                    expect(restored).toEqual({ ...entity, deletedAt: null });
                    const foundEntity = await queryService.findById(entity.testEntityPk);
                    expect(foundEntity).toEqual({ ...entity, deletedAt: null });
                });
                it('should return throw an error if unable to find', async () => {
                    const queryService = moduleRef.get(TestSoftDeleteEntityService);
                    const entity = seeds_1.TEST_SOFT_DELETE_ENTITIES[0];
                    await queryService.deleteOne(entity.testEntityPk);
                    return expect(queryService.restoreOne(entity.testEntityPk, {
                        filter: { stringType: { eq: seeds_1.TEST_SOFT_DELETE_ENTITIES[1].stringType } },
                    })).rejects.toThrow(`Unable to find TestSoftDeleteEntity with id: ${entity.testEntityPk}`);
                });
            });
        });
        describe('#restoreMany', () => {
            it('should restore multiple entities', async () => {
                const queryService = moduleRef.get(TestSoftDeleteEntityService);
                const entity = seeds_1.TEST_SOFT_DELETE_ENTITIES[0];
                const filter = { testEntityPk: { eq: entity.testEntityPk } };
                await queryService.deleteMany(filter);
                await queryService.restoreMany(filter);
                const foundEntity = await queryService.findById(entity.testEntityPk);
                expect(foundEntity).toEqual({ ...entity, deletedAt: null });
            });
            it('should fail if the useSoftDelete is not enabled', async () => {
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.restoreMany({ stringType: { eq: 'foo' } })).rejects.toThrow('Restore not allowed for non soft deleted entity TestEntity.');
            });
        });
    });
});
//# sourceMappingURL=typeorm-query.service.spec.js.map