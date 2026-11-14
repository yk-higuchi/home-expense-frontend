import { NavBar } from "@home-expense/ui";
import type { ReactElement, ReactNode } from "react";

import AppSideBar from "@/ui/parts/app-side-bar";
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
    { label: "経費属性", href: "/expense-attribute" },
    { label: "収入", href: "/income" },
    { label: "経費", href: `/expense?${searchParams}` },
    { label: "年間レポート", href: "/annual-report" },
  ];
  return (
    <div className={style.parent}>
      <AppSideBar items={items} />
      <div className={style.column}>
        <NavBar title="家庭用" />
        <main className={style.content}>{children}</main>
      </div>
    </div>
  );
};
export default DashboardLayout;
