import { NavBar } from "@home-expense/ui";
import type { ReactElement, ReactNode } from "react";

import AppSideBar from "@/ui/parts/app-side-bar";
import { PageContent, PageTransition } from "@/ui/parts/page-transition";
import style from "./dashboard-layout.module.css";

const DashboardLayout = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const now = new Date(Date.now());
  const searchParams = new URLSearchParams({
    year: now.getFullYear().toString(),
    month: (now.getMonth() + 1).toString(),
  }).toString();
  const items = [
    { label: "HOME", href: "/home" },
    { label: "収入属性", href: "/income-attribute" },
    { label: "支出属性", href: "/expense-attribute" },
    { label: "収入", href: "/income" },
    { label: "支出", href: `/expense?${searchParams}` },
    { label: "年間レポート", href: "/annual-report" },
  ];
  return (
    <PageTransition className={style.parent}>
      <AppSideBar items={items} />
      <div className={style.column}>
        <NavBar title="家計簿" />
        <main className={style.content}>
          <PageContent>{children}</PageContent>
        </main>
      </div>
    </PageTransition>
  );
};
export default DashboardLayout;
