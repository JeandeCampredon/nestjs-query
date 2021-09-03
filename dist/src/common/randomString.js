"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomString = void 0;
const uuid_1 = require("uuid");
const replacer = /-/g;
function randomString() {
    return uuid_1.v4().replace(replacer, '');
}
exports.randomString = randomString;
//# sourceMappingURL=randomString.js.map