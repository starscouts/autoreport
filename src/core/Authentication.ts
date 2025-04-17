import AutoreportBase from "./AutoreportBase";
import axios from "axios";
import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "crypto";

export default class Authentication extends AutoreportBase {
    public static getToken(token) {
        let tokens = JSON.parse(readFileSync(AutoreportBase.getRoot() + "/data/tokens.json").toString());

        if (Object.keys(tokens).includes(token) && new Date(tokens[token].date).getTime() - new Date().getTime() <= 31000000) {
            return tokens[token].info;
        } else {
            return false;
        }
    }

    private static saveToken(userInfo) {
        let tokens = JSON.parse(readFileSync(AutoreportBase.getRoot() + "/data/tokens.json").toString());
        let token = randomBytes(64).toString("base64url");

        tokens[token] = {
            date: new Date().getTime(),
            info: userInfo
        };
        writeFileSync(AutoreportBase.getRoot() + "/data/tokens.json", JSON.stringify(tokens));

        return token;
    }

    public static startFlow(req, res) {
        res.redirect(`${AutoreportBase.config.authentication.server}/api/rest/oauth2/auth?client_id=${AutoreportBase.config.authentication.id}&response_type=code&redirect_uri=${AutoreportBase.config.authentication.redirect}&scope=Hub&request_credentials=default&access_type=offline`);
    }

    public static checkAuthentication(req) {
        let _cookies = req.headers.cookie ?? "";
        let _tokens = _cookies.split(";").map(i => i.trim().split("=")).filter(i => i[0] === "AutoreportToken");
        let __tokens = _tokens[0] ?? [];
        let token = __tokens[1] ?? null;

        return !(!token || !this.getToken(token));
    }

    public static async callback(req, res) {
        if (!req.query.code) {
            res.redirect("/");
        }

        let token = (await axios.post(`${AutoreportBase.config.authentication.server}/api/rest/oauth2/token`, `grant_type=authorization_code&redirect_uri=${encodeURIComponent(AutoreportBase.config.authentication.redirect)}&code=${req.query.code}`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${AutoreportBase.config.authentication.id}:${AutoreportBase.config.authentication.secret}`).toString("base64")}`,
                'Accept': "application/json",
                'Content-Type': "application/x-www-form-urlencoded"
            }
        })).data.access_token;

        let userInfo = (await axios.get(`${AutoreportBase.config.authentication.server}/api/rest/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': "application/json"
            }
        })).data;

        let userToken = Authentication.saveToken(userInfo);
        res.cookie('AutoreportToken', userToken, { maxAge: 31000000, httpOnly: true });
        res.redirect("/");
    }

    public static testEndpoint(req, res) {
        if (Authentication.checkAuthentication(req)) {
            res.send("Authenticated");
        } else {
            res.send("NOT authenticated");
        }
    }

    public static protectedAPI(req, res, next) {
        if ([null, undefined, ""].includes(req.get("authorization"))) {
            return res.status(401).json({
                code: 401,
                message: "Please provide an Authorization header."
            });
        }

        if (req.get("authorization") !== AutoreportBase.config.api.token) {
            return res.status(403).json( {
                code: 403,
                message: "You do not have permission to use this endpoint."
            });
        }

        next();
    }
}