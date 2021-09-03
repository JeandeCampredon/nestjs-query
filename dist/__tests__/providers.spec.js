"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs-query/core");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ts_mockito_1 = require("ts-mockito");
const providers_1 = require("../src/providers");
const services_1 = require("../src/services");
describe('createTypeOrmQueryServiceProviders', () => {
    it('should create a provider for the entity', () => {
        class TestEntity {
        }
        const mockRepo = ts_mockito_1.mock(typeorm_2.Repository);
        const providers = providers_1.createTypeOrmQueryServiceProviders([TestEntity]);
        expect(providers).toHaveLength(1);
        expect(providers[0].provide).toBe(core_1.getQueryServiceToken(TestEntity));
        expect(providers[0].inject).toEqual([typeorm_1.getRepositoryToken(TestEntity)]);
        expect(providers[0].useFactory(ts_mockito_1.instance(mockRepo))).toBeInstanceOf(services_1.TypeOrmQueryService);
    });
});
//# sourceMappingURL=providers.spec.js.map