"use client";

import { useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { downloadFinanceReportPdf } from "@/features/finance/download-finance-report";
import { formatFinanceAmount } from "@/features/finance/format-amount";
import {
  buildFinanceReport,
  formatReportDate,
  type FinanceReport,
  type FinanceReportKind,
  type FinanceReportLine,
} from "@/features/finance/reports";
import { FinanceModal } from "./finance-modal";

const buttonClass =
  "rounded-lg border border-outline-variant/40 px-4 py-2 text-on-surface font-label-caps text-label-caps tracking-widest uppercase hover:bg-surface-container-high transition-colors";

export function FinanceReports({
  scope,
  lines,
}: {
  scope: string;
  lines: FinanceReportLine[];
}) {
  const [kind, setKind] = useState<FinanceReportKind | null>(null);
  const [category, setCategory] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const categories = useMemo(() => {
    return [
      ...new Set(
        lines.map((line) => line.category.trim() || "Sin categoría"),
      ),
    ].sort((a, b) => a.localeCompare(b, "es"));
  }, [lines]);
  const categoryFilter = categories.includes(category) ? category : "";
  const filteredLines = useMemo(() => {
    if (!categoryFilter) return lines;
    return lines.filter(
      (line) => (line.category.trim() || "Sin categoría") === categoryFilter,
    );
  }, [categoryFilter, lines]);
  const report = useMemo(
    () => buildFinanceReport(filteredLines),
    [filteredLines],
  );
  const title = kind === "detalle" ? "Reporte detallado" : "Reporte por categoría";

  async function download() {
    if (!kind) return;
    setDownloading(true);
    setError("");
    try {
      await downloadFinanceReportPdf({
        scope: categoryFilter ? `${scope} · ${categoryFilter}` : scope,
        kind,
        report,
      });
    } catch {
      setError("No se pudo generar el PDF.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <div className="mb-md flex flex-wrap gap-sm">
        <button
          type="button"
          onClick={() => setKind("categoria")}
          className={buttonClass}
        >
          Por categoría
        </button>
        <button
          type="button"
          onClick={() => setKind("detalle")}
          className={buttonClass}
        >
          Detalle
        </button>
      </div>
      <FinanceModal
        open={kind != null}
        title={title}
        maxWidth="52rem"
        onClose={() => {
          setKind(null);
          setCategory("");
          setError("");
        }}
      >
        <label className="mb-md flex flex-col gap-xs">
          <span className="text-sm text-on-surface-variant">Categoría</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
          >
            <option value="">Todas</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <div className="mb-md flex flex-wrap items-center justify-between gap-sm">
          <p className="text-sm text-on-surface-variant">{scope}</p>
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2 text-white font-label-caps text-label-caps tracking-widest uppercase hover:bg-secondary-container transition-colors disabled:opacity-60"
          >
            <MaterialIcon
              name="download"
              className="text-base leading-none normal-case tracking-normal"
            />
            {downloading ? "Generando PDF" : "Descargar PDF"}
          </button>
        </div>
        {error ? (
          <p className="mb-sm text-sm text-error" role="alert">
            {error}
          </p>
        ) : null}
        <ReportSummary report={report} />
        {kind === "detalle" ? (
          <DetailReport report={report} />
        ) : (
          <GroupedReport report={report} />
        )}
      </FinanceModal>
    </>
  );
}

function ReportSummary({ report }: { report: FinanceReport }) {
  return (
    <div className="mb-lg grid grid-cols-1 gap-sm sm:grid-cols-3">
      <SummaryCard label="Total de ingresos" value={report.totalIngresos} />
      <SummaryCard label="Total de egresos" value={report.totalEgresos} />
      <SummaryCard label="Saldo" value={report.saldo} emphasize />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: number;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-xl bg-surface-container-high p-sm">
      <p className="text-xs text-on-surface-variant">{label}</p>
      <p
        className={
          emphasize
            ? value >= 0
              ? "font-semibold text-green-400"
              : "font-semibold text-red-400"
            : "font-semibold text-on-surface"
        }
      >
        {formatFinanceAmount(value)}
      </p>
    </div>
  );
}

function GroupedReport({ report }: { report: FinanceReport }) {
  return (
    <div className="flex flex-col gap-lg">
      {report.sections.map((section) => (
        <section key={section.movementType}>
          <h3 className="mb-sm font-semibold text-on-surface">{section.title}</h3>
          {section.categories.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Sin movimientos.</p>
          ) : (
            <ul className="divide-y divide-outline-variant/20">
              {section.categories.map((category) => (
                <li
                  key={category.category}
                  className="flex items-start justify-between gap-sm py-2 text-sm"
                >
                  <span className="text-on-surface">{category.category}</span>
                  <span className="shrink-0 font-semibold text-on-surface">
                    {formatFinanceAmount(category.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-sm flex items-center justify-between gap-sm border-t border-outline-variant/30 pt-sm text-sm font-semibold text-on-surface">
            <span>Total {section.title.toLowerCase()}</span>
            <span>{formatFinanceAmount(section.total)}</span>
          </p>
        </section>
      ))}
    </div>
  );
}

function DetailReport({ report }: { report: FinanceReport }) {
  return (
    <div className="flex flex-col gap-lg">
      {report.sections.map((section) => (
        <section key={section.movementType}>
          <h3 className="mb-sm font-semibold text-on-surface">{section.title}</h3>
          {section.categories.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Sin movimientos.</p>
          ) : (
            section.categories.map((category) => (
              <div key={category.category} className="mb-md">
                <ul className="divide-y divide-outline-variant/20">
                  {category.lines.map((line) => (
                    <li
                      key={line.id}
                      className="grid grid-cols-1 gap-1 py-2 text-sm min-[450px]:grid-cols-[5.5rem_9rem_1fr_auto] min-[450px]:items-start min-[450px]:gap-sm"
                    >
                      <span className="text-on-surface-variant">
                        {formatReportDate(line.date)}
                      </span>
                      <span className="text-on-surface">{category.category}</span>
                      <span className="text-on-surface">
                        {line.description.trim() || "Sin descripción"}
                      </span>
                      <span className="font-semibold text-on-surface min-[450px]:text-right">
                        {formatFinanceAmount(line.totalAmount)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="flex items-center justify-between gap-sm border-t border-outline-variant/20 pt-2 text-sm font-semibold text-on-surface">
                  <span>Total {category.category}</span>
                  <span>{formatFinanceAmount(category.total)}</span>
                </p>
              </div>
            ))
          )}
          <p className="flex items-center justify-between gap-sm border-t border-outline-variant/30 pt-sm text-sm font-semibold text-on-surface">
            <span>Total {section.title.toLowerCase()}</span>
            <span>{formatFinanceAmount(section.total)}</span>
          </p>
        </section>
      ))}
    </div>
  );
}
