"use client";

import { Button } from "@home-expense/ui";
import { useRouter } from "next/navigation";
import { type ReactElement, useTransition } from "react";

const RetryButton = (): ReactElement => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      loading={isPending}
      onClick={() => startTransition(() => router.refresh())}
    >
      もう一度試す
    </Button>
  );
};
export default RetryButton;
