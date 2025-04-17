"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_v4_1 = __importDefault(require("uuid-v4"));
class UUID extends String {
    constructor() {
        super((0, uuid_v4_1.default)());
    }
}
exports.default = UUID;
//# sourceMappingURL=UUID.js.map