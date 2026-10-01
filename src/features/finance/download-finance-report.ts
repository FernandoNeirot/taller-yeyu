import { formatFinanceAmount } from "./format-amount";
import {
  formatReportDate,
  type FinanceReport,
  type FinanceReportKind,
} from "./reports";

function pdfText(value: string) {
  return value.replace(/\u00a0|\u202f/g, " ").replace(/\u2212/g, "-");
}

function pdfMoney(value: number) {
  return pdfText(formatFinanceAmount(value));
}

function fileSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function downloadFinanceReportPdf({
  scope,
  kind,
  report,
}: {
  scope: string;
  kind: FinanceReportKind;
  report: FinanceReport;
}) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  function ensure(height: number) {
    if (y + height <= pageHeight - margin) return;
    doc.addPage();
    y = 18;
  }

  function heading(text: string, size = 16) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(28, 28, 28);
    ensure(8);
    doc.text(pdfText(text), margin, y);
    y += size * 0.45 + 2;
  }

  function paragraph(text: string, size = 10) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(70, 70, 70);
    const lines = doc.splitTextToSize(pdfText(text), contentWidth);
    const lineHeight = 4.4;
    ensure(lines.length * lineHeight + 1);
    doc.text(lines, margin, y);
    y += lines.length * lineHeight + 1.5;
  }

  function rowLine(strong = false) {
    doc.setDrawColor(strong ? 90 : 196, strong ? 90 : 196, strong ? 90 : 196);
    doc.setLineWidth(strong ? 0.35 : 0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += strong ? 3.6 : 3.2;
  }

  function pair(label: string, value: string, bold = false) {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(11);
    doc.setTextColor(28, 28, 28);
    ensure(8);
    doc.text(pdfText(label), margin, y);
    doc.text(pdfText(value), pageWidth - margin, y, { align: "right" });
    y += 1.8;
    rowLine(bold);
  }

  function detailRow(
    date: string,
    category: string,
    description: string,
    amount: string,
    bold = false,
  ) {
    const dateWidth = 24;
    const categoryWidth = 42;
    const amountWidth = 32;
    const descriptionWidth = contentWidth - dateWidth - categoryWidth - amountWidth - 4;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(28, 28, 28);
    const categoryLines = doc.splitTextToSize(pdfText(category), categoryWidth);
    const descriptionLines = doc.splitTextToSize(
      pdfText(description),
      descriptionWidth,
    );
    const lineCount = Math.max(categoryLines.length, descriptionLines.length, 1);
    const lineHeight = 4;
    ensure(lineCount * lineHeight + 4);
    doc.text(pdfText(date), margin, y);
    doc.text(categoryLines, margin + dateWidth, y);
    doc.text(descriptionLines, margin + dateWidth + categoryWidth, y);
    doc.text(pdfText(amount), pageWidth - margin, y, { align: "right" });
    y += (lineCount - 1) * lineHeight + 1.8;
    rowLine(bold);
  }

  const title =
    kind === "detalle" ? "Reporte detallado" : "Reporte por categoría";
  heading(`${scope} · ${title}`);
  paragraph(
    `Generado el ${new Date().toLocaleDateString("es-AR")}. Los ingresos aparecen antes que los egresos.`,
  );
  y += 1;
  pair("Total de ingresos", pdfMoney(report.totalIngresos), true);
  pair("Total de egresos", pdfMoney(report.totalEgresos), true);
  pair("Saldo", pdfMoney(report.saldo), true);
  y += 3;

  for (const section of report.sections) {
    heading(section.title, 13);
    if (section.categories.length === 0) {
      paragraph("Sin movimientos.");
    } else if (kind === "categoria") {
      for (const category of section.categories) {
        pair(category.category, pdfMoney(category.total));
      }
    } else {
      detailRow("Fecha", "Categoría", "Descripción", "Monto", true);
      for (const category of section.categories) {
        for (const line of category.lines) {
          detailRow(
            formatReportDate(line.date),
            category.category,
            line.description.trim() || "Sin descripción",
            pdfMoney(line.totalAmount),
          );
        }
        pair(`Total ${category.category}`, pdfMoney(category.total), true);
        y += 1;
      }
    }
    pair(`Total ${section.title.toLowerCase()}`, pdfMoney(section.total), true);
    y += 4;
  }

  const kindName = kind === "detalle" ? "detalle" : "por-categoria";
  doc.save(`reporte-${fileSlug(scope)}-${kindName}.pdf`);
}
