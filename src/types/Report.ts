import AutoreportBase from "../core/AutoreportBase";
import UUID from "./UUID";

export interface Report extends AutoreportBase {
    id: UUID;
    service: string;
    time: Date;
    severity: ReportSeverity;
    response: ReportResponse;
    error: ReportError;
    systemInfo: SystemInformation;
}

export interface ReportError extends AutoreportBase {
    message: string;
    stacktrace: string;
    logs?: string;
    potentialFix: string|null;
}

export interface SystemInformation extends SystemProcess {
    systemUptime: number;
    os: string;
}

export interface SystemProcess extends AutoreportBase {
    pid: number;
    user: string;
    executable: string;
    memoryUsed: number;
    cpuTime: number;
    uptime: number;
}

export enum ReportSeverity {
    // Low      - something went wrong where it shouldn't, but it's not that bad
    // Medium   - something went wrong where it shouldn't, should be looked into
    // High     - something went wrong where it shouldn't, must be looked into
    // Critical - something went wrong where it really shouldn't of, must be looked into right that moment
    // Fatal    - something went so wrong that the service will not recover without help, must be looked into right that moment

    Low,
    Medium,
    High,
    Critical,
    Fatal
}

export enum ReportResponse {
    // None         - not been responded to yet
    // Acknowledged - report has been acknowledged
    // Ignored      - report has been ignored
    // STFU         - "Shut The Fuck Up", we're already aware of this please stop telling us
    
    None,
    Acknowledged,
    Ignored,
    STFU
}

export enum ProcessState {
    Stopped,
    Running,
    Starting,
    Idle,
    Blocked,
    Stopping
}