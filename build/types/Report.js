"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessState = exports.ReportResponse = exports.ReportSeverity = void 0;
var ReportSeverity;
(function (ReportSeverity) {
    // Low      - something went wrong where it shouldn't, but it's not that bad
    // Medium   - something went wrong where it shouldn't, should be looked into
    // High     - something went wrong where it shouldn't, must be looked into
    // Critical - something went wrong where it really shouldn't of, must be looked into right that moment
    // Fatal    - something went so wrong that the service will not recover without help, must be looked into right that moment
    ReportSeverity[ReportSeverity["Low"] = 0] = "Low";
    ReportSeverity[ReportSeverity["Medium"] = 1] = "Medium";
    ReportSeverity[ReportSeverity["High"] = 2] = "High";
    ReportSeverity[ReportSeverity["Critical"] = 3] = "Critical";
    ReportSeverity[ReportSeverity["Fatal"] = 4] = "Fatal";
})(ReportSeverity = exports.ReportSeverity || (exports.ReportSeverity = {}));
var ReportResponse;
(function (ReportResponse) {
    // None         - not been responded to yet
    // Acknowledged - report has been acknowledged
    // Ignored      - report has been ignored
    // STFU         - "Shut The Fuck Up", we're already aware of this please stop telling us
    ReportResponse[ReportResponse["None"] = 0] = "None";
    ReportResponse[ReportResponse["Acknowledged"] = 1] = "Acknowledged";
    ReportResponse[ReportResponse["Ignored"] = 2] = "Ignored";
    ReportResponse[ReportResponse["STFU"] = 3] = "STFU";
})(ReportResponse = exports.ReportResponse || (exports.ReportResponse = {}));
var ProcessState;
(function (ProcessState) {
    ProcessState[ProcessState["Stopped"] = 0] = "Stopped";
    ProcessState[ProcessState["Running"] = 1] = "Running";
    ProcessState[ProcessState["Starting"] = 2] = "Starting";
    ProcessState[ProcessState["Idle"] = 3] = "Idle";
    ProcessState[ProcessState["Blocked"] = 4] = "Blocked";
    ProcessState[ProcessState["Stopping"] = 5] = "Stopping";
})(ProcessState = exports.ProcessState || (exports.ProcessState = {}));
//# sourceMappingURL=Report.js.map