"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AutoreportBase_1 = __importDefault(require("./AutoreportBase"));
const axios_1 = __importDefault(require("axios"));
const node_fs_1 = require("node:fs");
const crypto_1 = require("crypto");
class Authentication extends AutoreportBase_1.default {
    static getToken(token) {
        let tokens = JSON.parse((0, node_fs_1.readFileSync)(AutoreportBase_1.default.getRoot() + "/data/tokens.json").toString());
        if (Object.keys(tokens).includes(token) && new Date(tokens[token].date).getTime() - new Date().getTime() <= 31000000) {
            return tokens[token].info;
        }
        else {
            return false;
        }
    }
    static saveToken(userInfo) {
        let tokens = JSON.parse((0, node_fs_1.readFileSync)(AutoreportBase_1.default.getRoot() + "/data/tokens.json").toString());
        let token = (0, crypto_1.randomBytes)(64).toString("base64url");
        tokens[token] = {
            date: new Date().getTime(),
            info: userInfo
        };
        (0, node_fs_1.writeFileSync)(AutoreportBase_1.default.getRoot() + "/data/tokens.json", JSON.stringify(tokens));
        return token;
    }
    static startFlow(req, res) {
        res.redirect(`${AutoreportBase_1.default.config.authentication.server}/api/rest/oauth2/auth?client_id=${AutoreportBase_1.default.config.authentication.id}&response_type=code&redirect_uri=${AutoreportBase_1.default.config.authentication.redirect}&scope=Hub&request_credentials=default&access_type=offline`);
    }
    static checkAuthentication(req) {
        let _cookies = req.headers.cookie ?? "";
        let _tokens = _cookies.split(";").map(i => i.trim().split("=")).filter(i => i[0] === "AutoreportToken");
        let __tokens = _tokens[0] ?? [];
        let token = __tokens[1] ?? null;
        return !(!token || !this.getToken(token));
    }
    static async callback(req, res) {
        if (!req.query.code) {
            res.redirect("/");
        }
        let token = (await axios_1.default.post(`${AutoreportBase_1.default.config.authentication.server}/api/rest/oauth2/token`, `grant_type=authorization_code&redirect_uri=${encodeURIComponent(AutoreportBase_1.default.config.authentication.redirect)}&code=${req.query.code}`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${AutoreportBase_1.default.config.authentication.id}:${AutoreportBase_1.default.config.authentication.secret}`).toString("base64")}`,
                'Accept': "application/json",
                'Content-Type': "application/x-www-form-urlencoded"
            }
        })).data.access_token;
        let userInfo = (await axios_1.default.get(`${AutoreportBase_1.default.config.authentication.server}/api/rest/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': "application/json"
            }
        })).data;
        let userToken = Authentication.saveToken(userInfo);
        res.cookie('AutoreportToken', userToken, { maxAge: 31000000, httpOnly: true });
        res.redirect("/");
    }
    static testEndpoint(req, res) {
        if (Authentication.checkAuthentication(req)) {
            res.send("Authenticated");
        }
        else {
            res.send("NOT authenticated");
        }
    }
    static protectedAPI(req, res, next) {
        if ([null, undefined, ""].includes(req.get("authorization"))) {
            return res.status(401).json({
                code: 401,
                message: "Please provide an Authorization header."
            });
        }
        if (req.get("authorization") !== AutoreportBase_1.default.config.api.token) {
            return res.status(403).json({
                code: 403,
                message: "You do not have permission to use this endpoint."
            });
        }
        next();
    }
}
exports.default = Authentication;
//# sourceMappingURL=Authentication.js.map