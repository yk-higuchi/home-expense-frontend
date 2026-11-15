"use client";

import { SideBar, type SideBarItem } from "@home-expense/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";

interface Props {
  items: Omit<SideBarItem, "active">[];
}

const isActive = (href: string, pathname: string): boolean => {
  const path = new URL(href, "http://localhost").pathname;
  return pathname === path || pathname.startsWith(`${path}/`);
};

const AppSideBar = ({ items }: Props): ReactElement => {
  const pathname = usePathname();
  return (
    <SideBar
      linkComponent={Link}
      items={items.map((item) => ({
        ...item,
        active: isActive(item.href, pathname),
      }))}
    />
  );
};
export default AppSideBar;
