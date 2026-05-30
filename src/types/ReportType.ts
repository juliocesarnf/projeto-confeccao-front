export type ReportSeverity = "info" | "warning" | "critical";

export interface Report {
  id: number;
  type: string;
  title: string;
  message: string;
  severity: ReportSeverity;
  status: string;
  entityType: string;
  entityId: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  readAt: Date | null;
}
