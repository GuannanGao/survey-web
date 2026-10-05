import { NextResponse } from "next/server";
import { getDb, COLUMNS, REQUIRED } from "@/lib/db";

// 仅在服务端（Route Handler）操作数据库，前端只发 JSON 请求
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: "无效的请求体" }, { status: 400 });
  }

  const db = getDb();
  const values: unknown[] = [new Date().toISOString()];

  for (const c of COLUMNS) {
    const raw = body[c.name];

    if (c.type === "INTEGER") {
      // 知情同意项必须为 1（勾选）
      if (c.name.startsWith("consent_")) {
        const checked = raw === 1 || raw === "1" || raw === true;
        if (!checked) {
          return NextResponse.json(
            { ok: false, message: "请勾选全部知情同意项后再提交" },
            { status: 400 }
          );
        }
        values.push(1);
        continue;
      }
      const n = Number(raw);
      if (Number.isNaN(n)) {
        if (REQUIRED.has(c.name)) {
          return NextResponse.json(
            { ok: false, message: `字段缺失或非法：${c.label}` },
            { status: 400 }
          );
        }
        values.push(0);
        continue;
      }
      values.push(n);
    } else if (c.type === "REAL") {
      const n = Number(raw);
      if (Number.isNaN(n)) {
        if (REQUIRED.has(c.name)) {
          return NextResponse.json(
            { ok: false, message: `字段缺失或非法：${c.label}` },
            { status: 400 }
          );
        }
        values.push(0);
        continue;
      }
      values.push(n);
    } else {
      const s = raw == null ? "" : String(raw);
      if (REQUIRED.has(c.name) && s.trim() === "") {
        return NextResponse.json(
          { ok: false, message: `必填项未填写：${c.label}` },
          { status: 400 }
        );
      }
      values.push(s);
    }
  }

  const names = COLUMNS.map((c) => c.name).join(", ");
  const placeholders = COLUMNS.map(() => "?").join(", ");
  const info = db
    .prepare(`INSERT INTO submissions (created_at, ${names}) VALUES (?, ${placeholders})`)
    .run(...(values as never[]));

  return NextResponse.json({ ok: true, id: Number(info.lastInsertRowid) });
}
