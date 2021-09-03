import { TestRelation } from './test-relation.entity';
import { TestEntity } from './test.entity';
export declare class TestEntityRelationEntity {
    testRelationId: string;
    testEntityId: string;
    testRelation?: TestRelation;
    testEntity?: TestEntity;
}
