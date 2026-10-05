"use client";

import { useState } from "react";

interface Header {
  key: string;
  label: string;
}

export default function AdminTable({
  rows,
  headers,
  adminKey,
}: {
  rows: Record<string, unknown>[];
  headers: Header[];
  adminKey: string;
}) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/export?key=${encodeURIComponent(adminKey)}`);
      if (!res.ok) {
        const txt = await res.text();
        alert(`导出失败：${txt}`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "survey_submissions.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("导出出错，请重试");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="toolbar">
        <button className="btn btn-primary" onClick={handleExport} disabled={exporting}>
          {exporting ? "导出中…" : "导出 Excel"}
        </button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h.key}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length}>暂无数据</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={String(r.id)}>
                  {headers.map((h) => (
                    <td key={h.key}>{String(r[h.key] ?? "")}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
