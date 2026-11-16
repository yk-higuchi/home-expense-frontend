"use client";

import {
  createContext,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useContext,
} from "react";
import { useNavigation } from "@/lib/hooks/use-navigation";
import layout from "@/ui/parts/list-layout.module.css";

interface ListNavigation {
  isPending: boolean;
  navigate: (href: string) => void;
}

const ListNavigationContext = createContext<ListNavigation>({
  isPending: false,
  navigate: () => {},
});

export const useListNavigation = (): ListNavigation =>
  useContext(ListNavigationContext);

const ListFrame = ({ children }: { children: ReactNode }): ReactElement => {
  const navigation = useNavigation();
  const handleClickCapture = (event: MouseEvent<HTMLDivElement>): void => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest<HTMLAnchorElement>("a[data-list-link]");
    if (link === null) return;
    event.preventDefault();
    navigation.navigate(link.getAttribute("href") ?? "");
  };
  return (
    <ListNavigationContext value={navigation}>
      <div className={layout.page} onClickCapture={handleClickCapture}>
        {children}
      </div>
    </ListNavigationContext>
  );
};
export default ListFrame;
