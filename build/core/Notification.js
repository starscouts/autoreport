"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AutoreportBase_1 = __importDefault(require("./AutoreportBase"));
const Report_1 = require("../types/Report");
class Notification extends AutoreportBase_1.default {
    constructor(report) {
        super();
        this.service = report.service;
        this.report = report;
    }
    async send() {
        let message;
        switch (this.report.severity) {
            case Report_1.ReportSeverity.Low:
                message = "Service " + this.service + " has encountered a minor error";
                break;
            case Report_1.ReportSeverity.Medium:
                message = "Service " + this.service + " has encountered an error";
                break;
            case Report_1.ReportSeverity.High:
                message = "Service " + this.service + " has encountered a major error";
                break;
            case Report_1.ReportSeverity.Critical:
                message = "Service " + this.service + " has encountered a critical error";
                break;
            case Report_1.ReportSeverity.Fatal:
                message = "Service " + this.service + " has encountered a fatal error";
                break;
        }
        await fetch("https://" + AutoreportBase_1.default.config.notifications.server, {
            method: "POST",
            body: JSON.stringify({
                topic: AutoreportBase_1.default.config.notifications.topic,
                message,
                title: "A service encountered an error",
                tags: ["crash", "service:" + this.service],
                priority: 3,
                actions: [{ "action": "view", "label": "Open report", "url": AutoreportBase_1.default.config.base + "/#/report/" + this.report.id }]
            }),
            headers: {
                "Authorization": "Basic " + Buffer.from(AutoreportBase_1.default.config.notifications.user + ":" + AutoreportBase_1.default.config.notifications.password).toString("base64"),
                "Content-Type": "application/json"
            }
        });
    }
}
exports.default = Notification;
//# sourceMappingURL=Notification.js.map