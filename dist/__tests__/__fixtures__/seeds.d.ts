import { Connection } from 'typeorm';
import { TestRelation } from './test-relation.entity';
import { TestSoftDeleteEntity } from './test-soft-delete.entity';
import { TestEntity } from './test.entity';
export declare const TEST_ENTITIES: TestEntity[];
export declare const TEST_SOFT_DELETE_ENTITIES: TestSoftDeleteEntity[];
export declare const TEST_RELATIONS: TestRelation[];
export declare const seed: (connection?: Connection) => Promise<void>;
