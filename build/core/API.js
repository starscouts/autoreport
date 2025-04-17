"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportEndpoint = void 0;
const AutoreportBase_1 = __importDefault(require("./AutoreportBase"));
const Authentication_1 = __importDefault(require("./Authentication"));
const Report_1 = require("../types/Report");
const node_fs_1 = require("node:fs");
const UUID_1 = __importDefault(require("../types/UUID"));
const Notification_1 = __importDefault(require("./Notification"));
class APIEndpoint extends AutoreportBase_1.default {
}
class ReportEndpoint extends APIEndpoint {
    static refresh(req, res) {
        ReportEndpoint.reports = JSON.parse((0, node_fs_1.readFileSync)("./data/reports.json").toString());
        return res.status(200).json({
            code: 200,
            message: "OK."
        });
    }
    static post(req, res) {
        if ([null, undefined, ""].includes(req.body.service) ||
            [null, undefined, ""].includes(req.body.time) ||
            [null, undefined, ""].includes(req.body.severity) ||
            [null, undefined, "", {}].includes(req.body.error) ||
            [null, undefined, "", {}].includes(req.body.systemInfo)) {
            return res.status(400).json({
                code: 400,
                message: "Report information is missing."
            });
        }
        if ([null, undefined, ""].includes(req.body.error.message) ||
            [null, undefined, ""].includes(req.body.error.stacktrace)) {
            return res.status(400).json({
                code: 400,
                message: "Error information is missing."
            });
        }
        if ([null, undefined, ""].includes(req.body.systemInfo.pid) ||
            [null, undefined, ""].includes(req.body.systemInfo.user) ||
            [null, undefined, ""].includes(req.body.systemInfo.executable) ||
            [null, undefined, ""].includes(req.body.systemInfo.memoryUsed) ||
            [null, undefined, ""].includes(req.body.systemInfo.cpuTimes) ||
            [null, undefined, ""].includes(req.body.systemInfo.uptime) ||
            [null, undefined, ""].includes(req.body.systemInfo.systemUptime) ||
            [null, undefined, ""].includes(req.body.systemInfo.os)) {
            return res.status(400).json({
                code: 400,
                message: "System information is missing."
            });
        }
        let severity = Report_1.ReportSeverity.Medium;
        switch (req.body.severity.toString().toLowerCase()) {
            case "low":
            case "0":
                severity = Report_1.ReportSeverity.Low;
                break;
            case "medium":
            case "1":
                severity = Report_1.ReportSeverity.Medium;
                break;
            case "high":
            case "2":
                severity = Report_1.ReportSeverity.High;
                break;
            case "critical":
            case "3":
                severity = Report_1.ReportSeverity.Critical;
                break;
            case "fatal":
            case "4":
                severity = Report_1.ReportSeverity.Fatal;
                break;
            default:
                severity = Report_1.ReportSeverity.Medium;
                break;
        }
        let reportError = {
            message: req.body.error.message,
            stacktrace: req.body.error.stacktrace,
            logs: req.body.error.logs ?? null,
            potentialFix: null
        };
        let systemInfo = req.body.systemInfo;
        let report = {
            id: new UUID_1.default(),
            service: req.body.service,
            time: new Date(req.body.time),
            severity,
            response: Report_1.ReportResponse.None,
            error: reportError,
            systemInfo
        };
        ReportEndpoint.reports.push(report);
        (0, node_fs_1.writeFileSync)(AutoreportBase_1.default.getRoot() + "/data/reports.json", JSON.stringify(ReportEndpoint.reports));
        let notification = new Notification_1.default(report);
        notification.send().then(() => {
            res.status(201).json({
                code: 201,
                message: "Created."
            });
        });
    }
    static get(req, res) {
        if (!Authentication_1.default.checkAuthentication(req))
            return res.redirect("/oauth2/start");
        if ([null, undefined, ""].includes(req.query.id)) {
            return res.status(400).json({
                code: 400,
                message: "An ID must be provided."
            });
        }
        if (!ReportEndpoint.reports.some(report => report.id === req.query.id)) {
            return res.status(404).json({
                code: 404,
                message: "Report with that ID does not exist."
            });
        }
        res.status(200).json(ReportEndpoint.reports.find(report => report.id === req.query.id));
    }
    static getMany(req, res) {
        if (!Authentication_1.default.checkAuthentication(req))
            return res.redirect("/oauth2/start");
        let page = parseInt(req.query.page ?? 0);
        let size = parseInt(req.query.size ?? 10);
        if (isNaN(page)) {
            return res.status(400).json({
                code: 400,
                message: "Page must be a number."
            });
        }
        if (isNaN(size)) {
            return res.status(400).json({
                code: 400,
                message: "Size must be a number."
            });
        }
        // task: split the array into chunks of `size`
        // good luck <3
        let reportsRequested = ReportEndpoint.reports.slice((size * page), size);
        res.status(200).json({
            reports: reportsRequested,
            page: page,
            pageCount: Math.ceil(ReportEndpoint.reports.length / size)
        });
    }
    static patch(req, res) {
        if (!Authentication_1.default.checkAuthentication(req))
            return res.redirect("/oauth2/start");
        if ([null, undefined, ""].includes(req.query.id) ||
            [null, undefined, ""].includes(req.query.response)) {
            return res.status(400).json({
                code: 400,
                message: "Report infomation is missing."
            });
        }
        if (!ReportEndpoint.reports.some(report => report.id === req.query.id)) {
            return res.status(404).json({
                code: 404,
                message: "That report does not exist."
            });
        }
        let reportIndex = ReportEndpoint.reports.findIndex(report => report.id === req.query.id);
        let response;
        switch (req.query.response.toString().toLowerCase()) {
            case "none":
            case "0":
                response = Report_1.ReportResponse.None;
                break;
            case "acknowledged":
            case "1":
                response = Report_1.ReportResponse.Acknowledged;
                break;
            case "ignored":
            case "2":
                response = Report_1.ReportResponse.Ignored;
                break;
            case "stfu":
            case "3":
                response = Report_1.ReportResponse.STFU;
                break;
            default:
                response = Report_1.ReportResponse.None;
                break;
        }
        ReportEndpoint.reports[reportIndex].response = response;
        (0, node_fs_1.writeFileSync)(AutoreportBase_1.default.getRoot() + "/data/reports.json", JSON.stringify(ReportEndpoint.reports));
        res.status(200).json({
            code: 200,
            message: "Updated."
        });
    }
}
exports.ReportEndpoint = ReportEndpoint;
ReportEndpoint.reports = JSON.parse((0, node_fs_1.readFileSync)("./data/reports.json").toString());
//# sourceMappingURL=API.js.map