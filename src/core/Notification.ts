import AutoreportBase from "./AutoreportBase";
import {Report, ReportSeverity} from "../types/Report";

export default class Notification extends AutoreportBase {
    service: string;
    report: Report;

    constructor(report: Report) {
        super();
        this.service = report.service;
        this.report = report;
    }

    public async send() {
        let message: string;

        switch (this.report.severity) {
            case ReportSeverity.Low: message = "Service " + this.service + " has encountered a minor error"; break;
            case ReportSeverity.Medium: message = "Service " + this.service + " has encountered an error"; break;
            case ReportSeverity.High: message = "Service " + this.service + " has encountered a major error"; break;
            case ReportSeverity.Critical: message = "Service " + this.service + " has encountered a critical error"; break;
            case ReportSeverity.Fatal: message = "Service " + this.service + " has encountered a fatal error"; break;
        }

        await fetch("https://" + AutoreportBase.config.notifications.server, {
            method: "POST",
            body: JSON.stringify({
                topic: AutoreportBase.config.notifications.topic,
                message,
                title: "A service encountered an error",
                tags: [ "crash", "service:" + this.service ],
                priority: 3,
                actions: [{ "action": "view", "label": "Open report", "url": AutoreportBase.config.base + "/#/report/" + this.report.id }]
            }),
            headers: {
                "Authorization": "Basic " + Buffer.from(AutoreportBase.config.notifications.user + ":" + AutoreportBase.config.notifications.password).toString("base64"),
                "Content-Type": "application/json"
            }
        })
    }
}