"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/**
 * 画面遷移を transition として行い、切り替え中かどうかを返す。
 * 絞り込みやページ送りで、サーバーからデータが届くまで「読み込み中」を出すために使う。
 */
export const useNavigation = (): {
  isPending: boolean;
  navigate: (href: string) => void;
} => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const navigate = (href: string): void => {
    startTransition(() => {
      router.push(href);
    });
  };
  return { isPending, navigate };
};
