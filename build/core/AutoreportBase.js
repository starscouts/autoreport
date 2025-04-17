"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yaml_1 = __importDefault(require("yaml"));
const node_fs_1 = require("node:fs");
class AutoreportBase {
    static getRoot() {
        return __dirname + "/../../";
    }
}
exports.default = AutoreportBase;
AutoreportBase.config = yaml_1.default.parse((0, node_fs_1.readFileSync)(AutoreportBase.getRoot() + "/config.yml").toString());
//# sourceMappingURL=AutoreportBase.js.map