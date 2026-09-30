import type { MovementType } from "./types";

export type FinanceReportLine = {
  id: string;
  date: string;
  category: string;
  description: string;
  movementType: MovementType;
  totalAmount: number;
};

export type FinanceReportCategory = {
  category: string;
  total: number;
  lines: FinanceReportLine[];
};

export type FinanceReportSection = {
  movementType: MovementType;
  title: "Ingresos" | "Egresos";
  total: number;
  categories: FinanceReportCategory[];
};

export type FinanceReport = {
  sections: [FinanceReportSection, FinanceReportSection];
  totalIngresos: number;
  totalEgresos: number;
  saldo: number;
};

export type FinanceReportKind = "categoria" | "detalle";

export function formatReportDate(date: string) {
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;
  return `${day}-${month}-${year}`;
}

function sectionFor(
  movementType: MovementType,
  lines: FinanceReportLine[],
): FinanceReportSection {
  const matching = lines.filter((line) => line.movementType === movementType);
  const byCategory = new Map<string, FinanceReportLine[]>();
  for (const line of matching) {
    const key = line.category.trim() || "Sin categoría";
    const bucket = byCategory.get(key) ?? [];
    bucket.push(line);
    byCategory.set(key, bucket);
  }

  const categories = [...byCategory.entries()]
    .map(([category, items]) => {
      const sorted = [...items].sort((a, b) => {
        const byDate = a.date.localeCompare(b.date);
        if (byDate !== 0) return byDate;
        return a.description.localeCompare(b.description, "es");
      });
      return {
        category,
        total: sorted.reduce((acc, line) => acc + line.totalAmount, 0),
        lines: sorted,
      };
    })
    .sort((a, b) => a.category.localeCompare(b.category, "es"));

  return {
    movementType,
    title: movementType === "ingreso" ? "Ingresos" : "Egresos",
    total: categories.reduce((acc, category) => acc + category.total, 0),
    categories,
  };
}

export function buildFinanceReport(lines: FinanceReportLine[]): FinanceReport {
  const ingresos = sectionFor("ingreso", lines);
  const egresos = sectionFor("egreso", lines);
  return {
    sections: [ingresos, egresos],
    totalIngresos: ingresos.total,
    totalEgresos: egresos.total,
    saldo: ingresos.total - egresos.total,
  };
}
