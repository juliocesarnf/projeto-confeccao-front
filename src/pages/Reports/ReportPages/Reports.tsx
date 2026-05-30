import { useEffect, useState, type ReactNode } from "react";

import ReportCard from "../Cards/ReportCard";
import ReportService from "../../../services/ReportsService";
import type { Report, ReportSeverity } from "../../../types/ReportType";

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterSeverity = ReportSeverity | "all";

// ─── Constants ────────────────────────────────────────────────────────────────

const TAB_CLASSES = {
  base: "px-2 py-2 flex-1 text-center rounded-md border transition-all duration-200 font-medium text-sm sm:text-base",
  active: "bg-blue-600 text-white border-blue-600 shadow-sm",
  inactive: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
};

const TABS: { label: string; value: FilterSeverity }[] = [
  { label: "Todos", value: "all" },
  { label: "Info", value: "info" },
  { label: "Aviso", value: "warning" },
  { label: "Crítico", value: "critical" },
];

// ─── Component ────────────────────────────────────────────────────────────────

function Reports(): ReactNode {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter]   = useState<FilterSeverity>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await ReportService.getAllReports();
        setReports(data);
      } catch {
        // Erro já notificado pelo interceptor da API.
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filtered = filter === "all"
    ? reports
    : reports.filter((r) => r.severity === filter);

  return (
    <div className="w-full max-w-6xl flex flex-col gap-4 px-0 sm:px-4">

      {/* Abas de filtro por severidade */}
      <div className="flex justify-center items-center gap-2 w-full">
        {TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`${TAB_CLASSES.base} ${filter === value ? TAB_CLASSES.active : TAB_CLASSES.inactive}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading ou lista de alertas */}
      {loading ? (
        <div className="fixed inset-0 md:left-64 bottom-16 md:bottom-0 flex justify-center items-center bg-white/60 backdrop-blur-sm z-50">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">Nenhum alerta encontrado.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

    </div>
  );
}

export default Reports;
