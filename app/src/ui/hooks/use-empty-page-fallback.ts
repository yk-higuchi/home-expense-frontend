"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const useEmptyPageFallback = (
  path: string,
  count: number,
  page: number,
): void => {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (count > 0 || page <= 1) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page - 1));
    router.replace(`${path}?${params}`);
  }, [path, count, page, searchParams, router]);
};
