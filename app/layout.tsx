import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "失业青年职业焦虑与自我效能研究",
  description: "中国失业青年职业焦虑与自我效能的关系 · 学术研究调查表",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <span className="brand">学术研究调查</span>
            <a className="nav-link" href="/admin">
              数据后台
            </a>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
