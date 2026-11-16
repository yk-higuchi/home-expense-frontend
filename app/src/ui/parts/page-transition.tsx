"use client";

import {
  createContext,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useContext,
  useState,
} from "react";
import { useNavigation } from "@/lib/hooks/use-navigation";
import style from "@/ui/parts/page-transition.module.css";
import { skeletonFor } from "@/ui/skeletons";

interface PageNavigation {
  isPending: boolean;
  target: string | null;
  navigate: (href: string) => void;
}

const PageTransitionContext = createContext<PageNavigation>({
  isPending: false,
  target: null,
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
  const { isPending, navigate: go } = useNavigation();
  const [target, setTarget] = useState<string | null>(null);
  const navigate = (href: string): void => {
    setTarget(href);
    go(href);
  };
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
    navigate(link.getAttribute("href") ?? "/");
  };
  return (
    <PageTransitionContext value={{ isPending, target, navigate }}>
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
  const { isPending, target } = usePageTransition();
  const skeleton = isPending && target !== null ? skeletonFor(target) : null;
  return (
    <div className={style.stack}>
      <div className={skeleton ? style.leaving : style.current}>{children}</div>
      {skeleton && (
        <div className={style.next} aria-busy="true">
          <p className={style.srOnly} role="status">
            読み込み中
          </p>
          {skeleton}
        </div>
      )}
    </div>
  );
};
