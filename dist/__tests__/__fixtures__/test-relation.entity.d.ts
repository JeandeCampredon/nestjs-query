import { TestEntityRelationEntity } from './test-entity-relation.entity';
import { TestEntity } from './test.entity';
export declare class TestRelation {
    testRelationPk: string;
    relationName: string;
    testEntityId?: string;
    uniDirectionalTestEntityId?: string;
    testEntity?: TestEntity;
    testEntityUniDirectional?: TestEntity;
    manyTestEntities?: TestEntity[];
    oneTestEntity?: TestEntity;
    testEntityRelation?: TestEntityRelationEntity;
}
