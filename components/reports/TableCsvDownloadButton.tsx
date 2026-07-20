"use client";

import { Download } from "lucide-react";

function csvEscape(value: string) {
  const cleanValue = value.replace(/\s+/g, " ").trim();
  return /[",\n]/.test(cleanValue) ? `"${cleanValue.replaceAll('"', '""')}"` : cleanValue;
}

export function TableCsvDownloadButton({ tableId, filename }: { tableId: string; filename: string }) {
  function downloadCsv() {
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = Array.from(table.querySelectorAll("tr")).map((row) =>
      Array.from(row.querySelectorAll("th,td")).map((cell) => csvEscape(cell.textContent ?? "")).join(",")
    );

    const blob = new Blob([`\uFEFF${rows.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={downloadCsv} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg">
      <Download size={15} />
      Download CSV
    </button>
  );
}
