import * as XLSX from "xlsx";
import { getDb, COLUMNS } from "@/lib/db";
import { ADMIN_KEY } from "@/lib/config";

export const dynamic = "force-dynamic";

// 导出全部记录为 .xlsx，通过正确的 Content-Type / Content-Disposition 触发浏览器下载
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (key !== ADMIN_KEY) {
    return new Response(JSON.stringify({ ok: false, message: "无权限" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = getDb();
  const rows = db.prepare("SELECT * FROM submissions ORDER BY id DESC").all() as Record<
    string,
    unknown
  >[];

  const headers = [
    { key: "id", label: "记录ID" },
    { key: "created_at", label: "提交时间" },
    ...COLUMNS.map((c) => ({ key: c.name, label: c.label })),
  ];

  const data = rows.map((r) => {
    const o: Record<string, unknown> = {};
    for (const h of headers) {
      let v = r[h.key];
      if (typeof v === "number" && h.key.startsWith("consent_")) {
        v = v ? "是" : "否";
      }
      o[h.label] = v ?? "";
    }
    return o;
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "调查数据");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(new Uint8Array(buf as Uint8Array), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="survey_submissions.xlsx"',
    },
  });
}
