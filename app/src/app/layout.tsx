import "@home-expense/ui/tokens.css";
import "./globals.css";
import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import type { ReactElement, ReactNode } from "react";

import DashboardLayout from "@/ui/dashboard-layout";

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
    <html lang="ja">
      <body className={noto.className}>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
};

export default RootLayout;
