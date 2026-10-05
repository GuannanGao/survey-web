import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// SQLite 文件位于项目根目录 data/survey.db（首次启动自动建表）
const DB_PATH = path.join(process.cwd(), "data", "survey.db");

export interface ColumnDef {
  name: string;
  type: "INTEGER" | "TEXT" | "REAL";
  label: string; // 导出 Excel 时使用的中文表头
}

// 所有业务字段（不含 id / created_at）。顺序即建表与导出顺序。
export const COLUMNS: ColumnDef[] = [
  // —— 知情同意（Annexure 2）——
  { name: "consent_understand_purpose", type: "INTEGER", label: "知情同意_了解目的流程风险" },
  { name: "consent_voluntary", type: "INTEGER", label: "知情同意_自愿可退出" },
  { name: "consent_confidential", type: "INTEGER", label: "知情同意_信息保密" },
  { name: "consent_academic", type: "INTEGER", label: "知情同意_仅用于学术" },
  { name: "consent_agree", type: "INTEGER", label: "知情同意_同意参加" },
  { name: "participant_signature", type: "TEXT", label: "参与者签名" },
  { name: "participant_date", type: "TEXT", label: "参与者日期" },
  { name: "researcher_signature", type: "TEXT", label: "研究者签名" },
  { name: "researcher_date", type: "TEXT", label: "研究者日期" },

  // —— 第一部分 人口学特征 ——
  { name: "gender", type: "TEXT", label: "性别" },
  { name: "age", type: "INTEGER", label: "年龄" },
  { name: "ethnicity", type: "TEXT", label: "民族" },
  { name: "education", type: "TEXT", label: "文化程度" },
  { name: "household_registration", type: "TEXT", label: "户籍所在地" },
  { name: "monthly_income", type: "REAL", label: "家庭人均月收入(元)" },
  { name: "unemployment_duration", type: "TEXT", label: "失业时长" },
  { name: "job_search_channel", type: "TEXT", label: "主要求职渠道" },
  { name: "expected_salary", type: "REAL", label: "期望薪资(元/月)" },
  { name: "marital_status", type: "TEXT", label: "婚姻状况" },

  // —— 第二部分 工作状态与经历 ——
  { name: "previous_job_type", type: "TEXT", label: "失业前岗位类型" },
  { name: "industry_category", type: "TEXT", label: "行业类别" },
  { name: "resignation_reason", type: "TEXT", label: "离职原因" },
  { name: "weekly_job_search", type: "INTEGER", label: "每周求职次数" },
  { name: "expected_reemployment_time", type: "TEXT", label: "期望再就业时间" },

  // —— 第三部分 一般自我效能量表（GSES）10 题 ——
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `gses_${i + 1}`,
    type: "INTEGER" as const,
    label: `自我效能GSES_${i + 1}`,
  })),

  // —— 第四部分 医院焦虑抑郁量表（HADS-A）焦虑子量表 7 题 ——
  ...Array.from({ length: 7 }, (_, i) => ({
    name: `hads_${i + 1}`,
    type: "INTEGER" as const,
    label: `焦虑HADS_${i + 1}`,
  })),
];

// 必填字段（用于服务端二次校验）
export const REQUIRED = new Set<string>([
  "consent_understand_purpose",
  "consent_voluntary",
  "consent_confidential",
  "consent_academic",
  "consent_agree",
  "participant_signature",
  "participant_date",
  "gender",
  "age",
  "education",
  "unemployment_duration",
  "job_search_channel",
  "marital_status",
  "monthly_income",
  "expected_salary",
  "previous_job_type",
  "industry_category",
  "resignation_reason",
  "weekly_job_search",
  "expected_reemployment_time",
  ...Array.from({ length: 10 }, (_, i) => `gses_${i + 1}`),
  ...Array.from({ length: 7 }, (_, i) => `hads_${i + 1}`),
]);

const CREATE_SQL = `
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  ${COLUMNS.map((c) => `${c.name} ${c.type}`).join(",\n  ")}
);
`;

let _db: Database.Database | null = null;

// 懒初始化：避免 next build 阶段触发文件系统访问
export function getDb(): Database.Database {
  if (_db) return _db;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  _db.exec(CREATE_SQL);
  return _db;
}
