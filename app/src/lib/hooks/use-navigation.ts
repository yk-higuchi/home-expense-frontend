"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

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
