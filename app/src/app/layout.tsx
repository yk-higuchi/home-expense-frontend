import "@home-expense/ui/tokens.css";
import "./globals.css";
import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import type { ReactElement, ReactNode } from "react";

import DashboardLayout from "@/ui/dashboard-layout";

// フォントは next/font で取得し、自前で配信する（Google のサーバーには取りに行かない）。
// CSS 変数 --font-noto-sans-jp を <html> に定義し、tokens.css の --font-family-base から使う
const noto = Noto_Sans_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: {
    template: "%s | 家庭用",
    default: "家庭用",
  },
  description: "家計の収入と支出を管理するアプリ",
};

const RootLayout = ({ children }: { children: ReactNode }): ReactElement => {
  return (
    <html lang="ja" className={noto.variable}>
      <body className={noto.className}>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
};

export default RootLayout;
