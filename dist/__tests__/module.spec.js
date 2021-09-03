"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
describe('NestjsQueryTypeOrmModule', () => {
    it('should create a module', () => {
        class TestEntity {
        }
        const typeOrmModule = src_1.NestjsQueryTypeOrmModule.forFeature([TestEntity]);
        expect(typeOrmModule.imports).toHaveLength(1);
        expect(typeOrmModule.module).toBe(src_1.NestjsQueryTypeOrmModule);
        expect(typeOrmModule.providers).toHaveLength(1);
        expect(typeOrmModule.exports).toHaveLength(2);
    });
});
//# sourceMappingURL=module.spec.js.map