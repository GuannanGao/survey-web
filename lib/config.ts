// 后台访问密钥（简单硬编码保护，非生产级鉴权）
// 可通过环境变量 ADMIN_KEY 覆盖
export const ADMIN_KEY = process.env.ADMIN_KEY ?? "survey-admin-2026";
