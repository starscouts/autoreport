import YAML from "yaml";
import { readFileSync } from "node:fs";

export default class AutoreportBase {
    public static getRoot() {
        return __dirname + "/../../";
    }

    public static config = YAML.parse(readFileSync(AutoreportBase.getRoot() + "/config.yml").toString());
}