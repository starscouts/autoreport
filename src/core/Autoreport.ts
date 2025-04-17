import AutoreportBase from "./AutoreportBase";
import express from "express";
import Authentication from "./Authentication";
import {Report, ReportError, ReportResponse, ReportSeverity} from "../types/Report";
import {readFileSync} from "node:fs";
import UUID from "../types/UUID";
import * as API from "./API";

export default class Autoreport extends AutoreportBase {
    constructor() {
        const app = express();

        app.use(express.static(AutoreportBase.getRoot() + "/assets"));
        app.use(express.json());
        app.set('view engine', 'ejs');

        app.get("/", (req, res) => {
            if (!Authentication.checkAuthentication(req)) return res.redirect("/oauth2/start");

            let reports: Report[] = JSON.parse(readFileSync("./data/reports.json").toString())

            res.render("index", { reports });
        });

        app.get("/oauth2/start", (req, res) => {
            Authentication.startFlow(req, res);
        });

        app.get("/oauth2/callback", (req, res) => {
            Authentication.callback(req, res);
        });

        app.post("/api/reports/refresh", (req, res) => {
            API.ReportEndpoint.refresh(req, res);
        })

        // API methods (public)
        app.get("/api/report", (req, res) => {
            API.ReportEndpoint.get(req, res);
        });

        app.get("/api/reports", (req, res) => {
            API.ReportEndpoint.getMany(req, res);
        });

        // API methods (private, need privateauth.equestria.dev authentication)
        app.patch("/api/report", (req, res) => {
            API.ReportEndpoint.patch(req, res);
        });

        // API methods (private, need token authentication)
        app.post("/api/report", Authentication.protectedAPI, (req, res) => {
            API.ReportEndpoint.post(req, res);
        });

        app.get("/oauth2/test", (req, res) => {
            Authentication.testEndpoint(req, res);
        })

        app.listen(34512);

        // To setup port forwarding:
        // - Ctrl+Shift+K/Cmd+Shift+K
        // - "Forward port"
        // - "34512:34512"
        // - You can now access it from http://localhost:34512

        console.log("Listening!");
        console.log("  - Public URL:  http://localhost:34512");
        console.log("  - OAuth2 test: http://localhost:34512/oauth2/start");

        super();
    }
}