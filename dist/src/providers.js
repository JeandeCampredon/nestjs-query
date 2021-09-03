"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTypeOrmQueryServiceProviders = void 0;
const core_1 = require("@nestjs-query/core");
const typeorm_1 = require("@nestjs/typeorm");
const services_1 = require("./services");
function createTypeOrmQueryServiceProvider(EntityClass, connection) {
    return {
        provide: core_1.getQueryServiceToken(EntityClass),
        useFactory(repo) {
            return new services_1.TypeOrmQueryService(repo);
        },
        inject: [typeorm_1.getRepositoryToken(EntityClass, connection)],
    };
}
const createTypeOrmQueryServiceProviders = (entities, connection) => entities.map((entity) => createTypeOrmQueryServiceProvider(entity, connection));
exports.createTypeOrmQueryServiceProviders = createTypeOrmQueryServiceProviders;
//# sourceMappingURL=providers.js.map