import uuid from "uuid-v4";

export default class UUID extends String {
    constructor() {
        super(uuid());
    }
}