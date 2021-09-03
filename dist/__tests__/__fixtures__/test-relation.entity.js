"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRelation = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const test_entity_relation_entity_1 = require("./test-entity-relation.entity");
const test_entity_1 = require("./test.entity");
let TestRelation = class TestRelation {
};
tslib_1.__decorate([
    typeorm_1.PrimaryColumn({ name: 'test_relation_pk' }),
    tslib_1.__metadata("design:type", String)
], TestRelation.prototype, "testRelationPk", void 0);
tslib_1.__decorate([
    typeorm_1.Column({ name: 'relation_name' }),
    tslib_1.__metadata("design:type", String)
], TestRelation.prototype, "relationName", void 0);
tslib_1.__decorate([
    typeorm_1.Column({ name: 'test_entity_id', nullable: true }),
    tslib_1.__metadata("design:type", String)
], TestRelation.prototype, "testEntityId", void 0);
tslib_1.__decorate([
    typeorm_1.Column({ name: 'uni_directional_test_entity_id', nullable: true }),
    tslib_1.__metadata("design:type", String)
], TestRelation.prototype, "uniDirectionalTestEntityId", void 0);
tslib_1.__decorate([
    typeorm_1.ManyToOne(() => test_entity_1.TestEntity, (te) => te.testRelations, { onDelete: 'CASCADE' }),
    typeorm_1.JoinColumn({ name: 'test_entity_id' }),
    tslib_1.__metadata("design:type", test_entity_1.TestEntity)
], TestRelation.prototype, "testEntity", void 0);
tslib_1.__decorate([
    typeorm_1.ManyToOne(() => test_entity_1.TestEntity, { onDelete: 'CASCADE' }),
    typeorm_1.JoinColumn({ name: 'uni_directional_test_entity_id' }),
    tslib_1.__metadata("design:type", test_entity_1.TestEntity)
], TestRelation.prototype, "testEntityUniDirectional", void 0);
tslib_1.__decorate([
    typeorm_1.ManyToMany(() => test_entity_1.TestEntity, (te) => te.manyTestRelations, { onDelete: 'CASCADE', nullable: false }),
    tslib_1.__metadata("design:type", Array)
], TestRelation.prototype, "manyTestEntities", void 0);
tslib_1.__decorate([
    typeorm_1.OneToOne(() => test_entity_1.TestEntity, (entity) => entity.oneTestRelation),
    tslib_1.__metadata("design:type", test_entity_1.TestEntity)
], TestRelation.prototype, "oneTestEntity", void 0);
tslib_1.__decorate([
    typeorm_1.OneToMany(() => test_entity_relation_entity_1.TestEntityRelationEntity, (ter) => ter.testRelation),
    tslib_1.__metadata("design:type", test_entity_relation_entity_1.TestEntityRelationEntity)
], TestRelation.prototype, "testEntityRelation", void 0);
TestRelation = tslib_1.__decorate([
    typeorm_1.Entity()
], TestRelation);
exports.TestRelation = TestRelation;
//# sourceMappingURL=test-relation.entity.js.map