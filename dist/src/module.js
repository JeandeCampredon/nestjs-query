"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestjsQueryTypeOrmModule = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const providers_1 = require("./providers");
class NestjsQueryTypeOrmModule {
    static forFeature(entities, connection) {
        const queryServiceProviders = providers_1.createTypeOrmQueryServiceProviders(entities, connection);
        const typeOrmModule = typeorm_1.TypeOrmModule.forFeature(entities, connection);
        return {
            imports: [typeOrmModule],
            module: NestjsQueryTypeOrmModule,
            providers: [...queryServiceProviders],
            exports: [...queryServiceProviders, typeOrmModule],
        };
    }
}
exports.NestjsQueryTypeOrmModule = NestjsQueryTypeOrmModule;
//# sourceMappingURL=module.js.map