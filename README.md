# 失业青年职业焦虑与自我效能研究 · 调查 Web 项目

学术研究调查表，主题为「中国失业青年职业焦虑与自我效能的关系」。参与者阅读研究说明与知情同意后填写问卷，数据存入本地 SQLite，后台可查看并导出 Excel。

## 技术栈

- **Next.js 16.2.12**（App Router）
- **React 19.2.8**
- **TypeScript**
- **better-sqlite3**（纯本地 SQLite 文件，无需额外服务）
- **SheetJS（xlsx）** 导出 Excel
- 后端 API 使用 Next.js Route Handlers（`app/api/...`）

## 目录结构

```
survey-web/
├── app/
│   ├── layout.tsx            # 全局布局 + 顶部导航
│   ├── globals.css           # 样式
│   ├── page.tsx              # 首页：完整调查表填写页（客户端组件）
│   ├── admin/
│   │   ├── page.tsx          # 后台：数据列表（服务端组件，密钥保护）
│   │   └── AdminTable.tsx    # 后台表格 + 导出按钮（客户端组件）
│   └── api/
│       ├── submit/route.ts   # POST 接收问卷，写入 SQLite
│       └── export/route.ts   # GET 导出 Excel（xlsx）
├── lib/
│   ├── db.ts                 # SQLite 建表 + 单例连接（仅服务端使用）
│   └── config.ts             # 后台密钥 ADMIN_KEY
├── data/                     # SQLite 文件 survey.db（首次运行自动生成）
└── package.json
```

## 运行方式

### 1. 安装依赖

```bash
cd /Users/yock/workspace/survey-web
npm install
```

> better-sqlite3 为原生模块，安装时需要本地编译环境（macOS 已具备 Xcode Command Line Tools / Python3 / make / g++）。首次 `npm install` 会编译原生扩展，稍慢属正常。

### 2. 启动开发服务器

```bash
npm run dev
```

默认监听 **http://localhost:3000**（如需修改端口：`npm run dev -- -p 8080`）。

### 3. 生产构建（可选）

```bash
npm run build
npm start
```

## 页面与接口

- **首页 `/`**：展示完整调查表（研究信息告知单 → 知情同意书 → 调查问卷四部分），前端做必填校验与知情同意全勾校验，提交后 POST 到 `/api/submit`。
- **后台 `/admin?key=survey-admin-2026`**：以表格展示所有已提交记录（可横向滚动），点击「导出 Excel」调用 `/api/export` 下载 `.xlsx`。
  - 密钥可在 `lib/config.ts` 修改，或通过环境变量 `ADMIN_KEY` 覆盖。
  - 不带正确 `key` 访问 `/admin` 会显示「访问受限」。
- **POST `/api/submit`**：接收 JSON，服务端二次校验并写入 SQLite，返回 `{ ok: true, id }`。
- **GET `/api/export?key=xxx`**：服务端用 SheetJS 生成 xlsx 并返回，触发浏览器下载。

## 数据库说明

- 文件位置：`data/survey.db`（项目根目录）。
- 单表 `submissions`，字段覆盖全部问卷题目 + 知情同意 + 签名 + 提交时间 `created_at`。
- 首次启动访问接口时自动建表（`CREATE TABLE IF NOT EXISTS`）。

## 注意事项

- 数据库操作（better-sqlite3）全部位于 Route Handler / 服务端组件中，前端仅发送 HTTP 请求，避免 SSR 下原生模块报错。
- Excel 导出在服务端 Route Handler 完成，并设置正确的 `Content-Type` 与 `Content-Disposition` 以触发下载。
