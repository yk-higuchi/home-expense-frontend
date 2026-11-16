import { LoadError } from "@home-expense/ui";
import type { ReactElement } from "react";
import form from "@/ui/parts/form.module.css";
import RetryButton from "@/ui/parts/retry-button";

export const LoadFailed = (): ReactElement => (
  <LoadError action={<RetryButton />} />
);

export const FormLoadFailed = (): ReactElement => (
  <div className={form.formStyle}>
    <LoadFailed />
  </div>
);
