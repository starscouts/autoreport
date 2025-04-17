"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AutoreportBase_1 = __importDefault(require("./AutoreportBase"));
const express_1 = __importDefault(require("express"));
const Authentication_1 = __importDefault(require("./Authentication"));
const node_fs_1 = require("node:fs");
const API = __importStar(require("./API"));
class Autoreport extends AutoreportBase_1.default {
    constructor() {
        const app = (0, express_1.default)();
        app.use(express_1.default.static(AutoreportBase_1.default.getRoot() + "/assets"));
        app.use(express_1.default.json());
        app.set('view engine', 'ejs');
        app.get("/", (req, res) => {
            if (!Authentication_1.default.checkAuthentication(req))
                return res.redirect("/oauth2/start");
            let reports = JSON.parse((0, node_fs_1.readFileSync)("./data/reports.json").toString());
            res.render("index", { reports });
        });
        app.get("/oauth2/start", (req, res) => {
            Authentication_1.default.startFlow(req, res);
        });
        app.get("/oauth2/callback", (req, res) => {
            Authentication_1.default.callback(req, res);
        });
        app.post("/api/reports/refresh", (req, res) => {
            API.ReportEndpoint.refresh(req, res);
        });
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
        app.post("/api/report", Authentication_1.default.protectedAPI, (req, res) => {
            API.ReportEndpoint.post(req, res);
        });
        app.get("/oauth2/test", (req, res) => {
            Authentication_1.default.testEndpoint(req, res);
        });
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
exports.default = Autoreport;
//# sourceMappingURL=Autoreport.js.map