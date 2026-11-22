import { ButtonLink, SubmitButton } from "@home-expense/ui";
import Link from "next/link";
import type { ReactElement, ReactNode } from "react";
import style from "./form.module.css";

export const listHref = (path: string, query?: string): string =>
  query ? `${path}?${query}` : path;

const FormActions = ({
  backHref,
  children,
}: {
  backHref: string;
  children: ReactNode;
}): ReactElement => (
  <div className={style.actions}>
    <ButtonLink
      href={backHref}
      variant="secondary"
      linkComponent={Link}
      className={style.action}
    >
      一覧に戻る
    </ButtonLink>
    <SubmitButton className={style.action}>{children}</SubmitButton>
  </div>
);
export default FormActions;
