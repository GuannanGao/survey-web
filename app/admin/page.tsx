import { getDb, COLUMNS } from "@/lib/db";
import { ADMIN_KEY } from "@/lib/config";
import AdminTable from "./AdminTable";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const key = typeof sp.key === "string" ? sp.key : "";

  if (key !== ADMIN_KEY) {
    return (
      <main className="container">
        <div className="card">
          <h1>访问受限</h1>
          <p>请提供正确的访问密钥，例如：</p>
          <p>
            <code>/admin?key={ADMIN_KEY}</code>
          </p>
        </div>
      </main>
    );
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

  return (
    <main className="container">
      <div className="card">
        <h1>调查数据后台</h1>
        <p>共 {rows.length} 条记录（按提交时间倒序）。</p>
        <AdminTable rows={rows} headers={headers} adminKey={key} />
      </div>
    </main>
  );
}
