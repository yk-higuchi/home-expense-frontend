import { NavBar } from "@home-expense/ui";
import { cookies } from "next/headers";
import type { ReactElement, ReactNode } from "react";

import AppSideBar from "@/ui/parts/app-side-bar";
import { PageContent, PageTransition } from "@/ui/parts/page-transition";
import {
  SiteMenu,
  SiteMenuButton,
  SiteMenuProvider,
} from "@/ui/parts/site-menu";
import { isMenuCollapsed, MENU_COOKIE } from "@/ui/parts/site-menu-cookie";
import style from "./dashboard-layout.module.css";

const DashboardLayout = async ({
  children,
}: {
  children: ReactNode;
}): Promise<ReactElement> => {
  const cookieStore = await cookies();
  const collapsed = isMenuCollapsed(cookieStore.get(MENU_COOKIE)?.value);
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
      <a href="#main" className={style.skip}>
        本文へ移動
      </a>
      <SiteMenuProvider initialCollapsed={collapsed}>
        <SiteMenu className={style.menu}>
          <AppSideBar items={items} />
        </SiteMenu>
        <div className={style.column}>
          <NavBar title="家計簿" start={<SiteMenuButton />} />
          <main id="main" tabIndex={-1} className={style.content}>
            <PageContent>{children}</PageContent>
          </main>
        </div>
      </SiteMenuProvider>
    </PageTransition>
  );
};
export default DashboardLayout;
