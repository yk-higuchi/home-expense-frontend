import { ButtonLink, LoadError } from "@home-expense/ui";
import Link from "next/link";
import type { ReactElement } from "react";
import form from "@/ui/parts/form.module.css";

const NotFound = (): ReactElement => (
  <div className={form.formStyle}>
    <LoadError
      message="この支出は見つかりませんでした。削除された可能性があります。"
      action={
        <ButtonLink href="/expense" linkComponent={Link}>
          支出の一覧に戻る
        </ButtonLink>
      }
    />
  </div>
);
export default NotFound;
