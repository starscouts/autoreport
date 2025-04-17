import AutoreportBase from "./AutoreportBase";
import Authentication from "./Authentication";
import {Report, ReportError, ReportResponse, ReportSeverity, SystemInformation, SystemProcess} from "../types/Report";
import {readFileSync, writeFileSync} from "node:fs";
import UUID from "../types/UUID";
import Notification from "./Notification";

class APIEndpoint extends AutoreportBase {}

export class ReportEndpoint extends APIEndpoint {
    private static reports: Report[] = JSON.parse(readFileSync("./data/reports.json").toString());

    public static refresh(req, res) {
        ReportEndpoint.reports = JSON.parse(readFileSync("./data/reports.json").toString());
        return res.status(200).json({
            code: 200,
            message: "OK."
        });
    }

    public static post(req, res) {
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

        let severity = ReportSeverity.Medium;

        switch (req.body.severity.toString().toLowerCase()) {
            case "low":
            case "0":
                severity = ReportSeverity.Low;
                break;
            case "medium":
            case "1":
                severity = ReportSeverity.Medium;
                break;
            case "high":
            case "2":
                severity = ReportSeverity.High;
                break;
            case "critical":
            case "3":
                severity = ReportSeverity.Critical;
                break;
            case "fatal":
            case "4":
                severity = ReportSeverity.Fatal;
                break;
            default:
                severity = ReportSeverity.Medium;
                break;
        }

        let reportError: ReportError = {
            message: req.body.error.message,
            stacktrace: req.body.error.stacktrace,
            logs: req.body.error.logs ?? null,
            potentialFix: null
        }

        let systemInfo: SystemInformation = req.body.systemInfo;

        let report: Report = {
            id: new UUID(),
            service: req.body.service,
            time: new Date(req.body.time),
            severity,
            response: ReportResponse.None,
            error: reportError,
            systemInfo
        }

        ReportEndpoint.reports.push(report);
        writeFileSync(AutoreportBase.getRoot() + "/data/reports.json", JSON.stringify(ReportEndpoint.reports));

        let notification = new Notification(report);
        notification.send().then(() => {
            res.status(201).json({
                code: 201,
                message: "Created."
            });
        });
    }

    public static get(req, res) {
        if (!Authentication.checkAuthentication(req)) return res.redirect("/oauth2/start");

        if([null, undefined, ""].includes(req.query.id)) {
            return res.status(400).json({
                code: 400,
                message: "An ID must be provided."
            });
        }

        if(!ReportEndpoint.reports.some(report => report.id === req.query.id)) {
            return res.status(404).json({
                code: 404,
                message: "Report with that ID does not exist."
            });
        }

        res.status(200).json(ReportEndpoint.reports.find(report => report.id === req.query.id));
    }

    public static getMany(req, res) {
        if (!Authentication.checkAuthentication(req)) return res.redirect("/oauth2/start");

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

    public static patch(req, res) {
        if (!Authentication.checkAuthentication(req)) return res.redirect("/oauth2/start");

        if ([null, undefined, ""].includes(req.query.id) ||
        [null, undefined, ""].includes(req.query.response)) {
            return res.status(400).json({
                code: 400,
                message: "Report infomation is missing."
            });
        }

        if(!ReportEndpoint.reports.some(report => report.id === req.query.id)) {
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
                response = ReportResponse.None;
                break;
            case "acknowledged":
            case "1":
                response = ReportResponse.Acknowledged;
                break;
            case "ignored":
            case "2":
                response = ReportResponse.Ignored;
                break;
            case "stfu":
            case "3":
                response = ReportResponse.STFU;
                break;
            default:
                response = ReportResponse.None;
                break;
        }

        ReportEndpoint.reports[reportIndex].response = response;
        writeFileSync(AutoreportBase.getRoot() + "/data/reports.json", JSON.stringify(ReportEndpoint.reports));

        res.status(200).json({
            code: 200,
            message: "Updated."
        });
    }
}