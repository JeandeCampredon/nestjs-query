"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestEntityRelationEntity = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const test_relation_entity_1 = require("./test-relation.entity");
const test_entity_1 = require("./test.entity");
let TestEntityRelationEntity = class TestEntityRelationEntity {
};
tslib_1.__decorate([
    typeorm_1.PrimaryColumn({ name: 'test_relation_id' }),
    tslib_1.__metadata("design:type", String)
], TestEntityRelationEntity.prototype, "testRelationId", void 0);
tslib_1.__decorate([
    typeorm_1.PrimaryColumn({ name: 'test_entity_id' }),
    tslib_1.__metadata("design:type", String)
], TestEntityRelationEntity.prototype, "testEntityId", void 0);
tslib_1.__decorate([
    typeorm_1.ManyToOne(() => test_relation_entity_1.TestRelation, (tr) => tr.testEntityRelation),
    typeorm_1.JoinColumn({ name: 'test_relation_id' }),
    tslib_1.__metadata("design:type", test_relation_entity_1.TestRelation)
], TestEntityRelationEntity.prototype, "testRelation", void 0);
tslib_1.__decorate([
    typeorm_1.ManyToOne(() => test_entity_1.TestEntity, (te) => te.testEntityRelation),
    typeorm_1.JoinColumn({ name: 'test_entity_id' }),
    tslib_1.__metadata("design:type", test_entity_1.TestEntity)
], TestEntityRelationEntity.prototype, "testEntity", void 0);
TestEntityRelationEntity = tslib_1.__decorate([
    typeorm_1.Entity()
], TestEntityRelationEntity);
exports.TestEntityRelationEntity = TestEntityRelationEntity;
//# sourceMappingURL=test-entity-relation.entity.js.map