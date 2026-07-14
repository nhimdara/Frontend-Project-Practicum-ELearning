import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const STATUS_HEADERS = ["Status", "Approval", "Featured"];
const NUMERIC_HEADERS = ["ID", "Academic Year", "Credits", "Hours", "Value"];

export const downloadDashboardReport = ({
  report,
  subject,
  author,
  headerLabel,
  footerLabel,
}) => {
  const landscape = report.headers.length > 6;
  const document = new jsPDF({
    orientation: landscape ? "landscape" : "portrait",
    unit: "pt",
    format: "a4",
  });
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  const totalPagesPlaceholder = "{total_pages_count_string}";
  const generatedAt = new Date().toLocaleString();
  const progressIndex = report.headers.indexOf("Progress");
  const body = report.rows.map((row) =>
    row.map((value, index) => {
      if (index === progressIndex && typeof value === "number") {
        return `${Math.round(value * 100)}%`;
      }
      return value ?? "";
    }),
  );

  document.setProperties({
    title: report.title,
    subject,
    author,
    creator: "LearnFlow",
  });

  autoTable(document, {
    head: [report.headers],
    body,
    startY: 118,
    margin: { top: 76, right: 30, bottom: 42, left: 30 },
    theme: "striped",
    showHead: "everyPage",
    rowPageBreak: "avoid",
    styles: {
      font: "helvetica",
      fontSize: landscape ? 7 : 8,
      textColor: [51, 65, 85],
      cellPadding: landscape ? 3.5 : 5,
      lineColor: [226, 232, 240],
      lineWidth: 0.3,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
      lineColor: [67, 56, 202],
      lineWidth: 0.5,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      const header = report.headers[data.column.index];
      if (NUMERIC_HEADERS.includes(header)) {
        data.cell.styles.halign = "right";
      }
      if (STATUS_HEADERS.includes(header)) {
        const value = String(data.cell.raw ?? "").toLowerCase();
        const positive = ["active", "published", "approved", "yes"].some(
          (text) => value.includes(text),
        );
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = positive ? [4, 120, 87] : [180, 83, 9];
      }
    },
    willDrawPage: (data) => {
      document.setFillColor(30, 41, 59);
      document.rect(0, 0, pageWidth, 60, "F");
      document.setFont("helvetica", "bold");
      document.setFontSize(17);
      document.setTextColor(255, 255, 255);
      document.text(report.title, 30, 30);
      document.setFont("helvetica", "normal");
      document.setFontSize(8);
      document.setTextColor(203, 213, 225);
      document.text(`${headerLabel} - Generated ${generatedAt}`, 30, 46);

      if (data.pageNumber === 1) {
        document.setFillColor(238, 242, 255);
        document.roundedRect(30, 74, 150, 29, 4, 4, "F");
        document.setFont("helvetica", "bold");
        document.setFontSize(8);
        document.setTextColor(67, 56, 202);
        document.text("TOTAL RECORDS", 41, 86);
        document.setFontSize(14);
        document.setTextColor(15, 23, 42);
        document.text(String(report.rows.length), 41, 99);
      }
    },
    didDrawPage: (data) => {
      document.setDrawColor(226, 232, 240);
      document.line(30, pageHeight - 30, pageWidth - 30, pageHeight - 30);
      document.setFont("helvetica", "normal");
      document.setFontSize(7);
      document.setTextColor(100, 116, 139);
      document.text(footerLabel, 30, pageHeight - 17);
      document.text(
        `Page ${data.pageNumber} of ${totalPagesPlaceholder}`,
        pageWidth - 30,
        pageHeight - 17,
        { align: "right" },
      );
    },
  });

  if (typeof document.putTotalPages === "function") {
    document.putTotalPages(totalPagesPlaceholder);
  }
  const date = new Date().toISOString().slice(0, 10);
  document.save(`${report.name}-${date}.pdf`);
};
