import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { Report, ReportSeverity } from "../../../types/ReportType";

type Props = {
  report: Report;
};

const SEVERITY_STYLES: Record<ReportSeverity, { bg: string; border: string; icon: React.ReactNode }> = {
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    icon: <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />,
  },
  critical: {
    bg: "bg-red-100",
    border: "border-red-400",
    icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
  },
};

function ReportCard({ report }: Props) {
  const { bg, border, icon } = SEVERITY_STYLES[report.severity];
  const createdAt = new Date(report.createdAt);
  const isUnread = report.readAt === null;

  return (
    <div
      className={`relative px-3 py-2 border rounded-md flex flex-col sm:flex-row sm:items-start gap-3 w-full ${bg} ${border} ${isUnread ? "ring-2 ring-offset-1 ring-blue-400" : "opacity-80"}`}
    >
      <div className="mt-0.5">{icon}</div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold truncate">{report.title}</p>
          {isUnread && (
            <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">Novo</span>
          )}
        </div>
        <p className="text-sm text-gray-700 mt-0.5">{report.message}</p>
        <p className="text-xs text-gray-500 mt-1">
          {createdAt.toLocaleDateString("pt-BR")} às {createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <div className="text-xs text-gray-500 sm:text-right shrink-0">
        <span className="capitalize">{report.entityType}</span>
        <span className="ml-1">#{report.entityId}</span>
      </div>
    </div>
  );
}

export default ReportCard;
