"use client";

import {
  createContext,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useContext,
} from "react";
import { useNavigation } from "@/lib/hooks/use-navigation";
import LoadingState from "@/ui/parts/loading-state";

interface PageNavigation {
  isPending: boolean;
  navigate: (href: string) => void;
}

const PageTransitionContext = createContext<PageNavigation>({
  isPending: false,
  navigate: () => {},
});

export const usePageTransition = (): PageNavigation =>
  useContext(PageTransitionContext);

const isPlainClick = (event: MouseEvent): boolean =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

export const PageTransition = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}): ReactElement => {
  const navigation = useNavigation();
  const handleClickCapture = (event: MouseEvent<HTMLDivElement>): void => {
    if (!isPlainClick(event) || !(event.target instanceof Element)) return;
    const link = event.target.closest<HTMLAnchorElement>("a[href^='/']");
    if (
      link === null ||
      link.hasAttribute("data-list-link") ||
      link.hasAttribute("download") ||
      (link.target !== "" && link.target !== "_self")
    )
      return;
    event.preventDefault();
    navigation.navigate(link.getAttribute("href") ?? "/");
  };
  return (
    <PageTransitionContext value={navigation}>
      <div className={className} onClickCapture={handleClickCapture}>
        {children}
      </div>
    </PageTransitionContext>
  );
};

export const PageContent = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const { isPending } = usePageTransition();
  return <>{isPending ? <LoadingState /> : children}</>;
};
