import { TestEntityRelationEntity } from './test-entity-relation.entity';
import { TestRelation } from './test-relation.entity';
export declare class TestEntity {
    testEntityPk: string;
    stringType: string;
    boolType: boolean;
    numberType: number;
    dateType: Date;
    testRelations?: TestRelation[];
    manyTestRelations?: TestRelation[];
    manyToManyUniDirectional?: TestRelation[];
    oneTestRelation?: TestRelation;
    testEntityRelation?: TestEntityRelationEntity;
}
