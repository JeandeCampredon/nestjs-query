"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.truncate = exports.getTestConnection = exports.closeTestConnection = exports.createTestConnection = exports.CONNECTION_OPTIONS = void 0;
// this is needed to create a query builder in typeorm :(
const typeorm_1 = require("typeorm");
const test_entity_relation_entity_1 = require("./test-entity-relation.entity");
const test_relation_entity_1 = require("./test-relation.entity");
const test_soft_delete_entity_1 = require("./test-soft-delete.entity");
const test_entity_1 = require("./test.entity");
const seeds_1 = require("./seeds");
exports.CONNECTION_OPTIONS = {
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [test_entity_1.TestEntity, test_soft_delete_entity_1.TestSoftDeleteEntity, test_relation_entity_1.TestRelation, test_entity_relation_entity_1.TestEntityRelationEntity],
    synchronize: true,
    logging: false,
};
function createTestConnection() {
    return typeorm_1.createConnection(exports.CONNECTION_OPTIONS);
}
exports.createTestConnection = createTestConnection;
function closeTestConnection() {
    return typeorm_1.getConnection().close();
}
exports.closeTestConnection = closeTestConnection;
function getTestConnection() {
    return typeorm_1.getConnection();
}
exports.getTestConnection = getTestConnection;
const tables = [
    'test_entity',
    'test_relation',
    'test_entity_relation_entity',
    'test_soft_delete_entity',
    'test_entity_many_test_relations_test_relation',
];
const truncate = async (connection) => {
    await tables.reduce(async (prev, table) => {
        await prev;
        await connection.query(`DELETE FROM ${table}`);
    }, Promise.resolve());
};
exports.truncate = truncate;
const refresh = async (connection = typeorm_1.getConnection()) => {
    await exports.truncate(connection);
    return seeds_1.seed(connection);
};
exports.refresh = refresh;
//# sourceMappingURL=connection.fixture.js.map