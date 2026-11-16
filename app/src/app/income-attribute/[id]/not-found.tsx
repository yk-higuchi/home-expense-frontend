import { ButtonLink, LoadError } from "@home-expense/ui";
import Link from "next/link";
import type { ReactElement } from "react";
import form from "@/ui/parts/form.module.css";
import { PageHeading } from "@/ui/parts/page-heading";

const NotFound = (): ReactElement => (
  <div className={form.formStyle}>
    <PageHeading>収入属性が見つかりません</PageHeading>
    <LoadError
      message="この収入属性は見つかりませんでした。削除された可能性があります。"
      action={
        <ButtonLink href="/income-attribute" linkComponent={Link}>
          収入属性の一覧に戻る
        </ButtonLink>
      }
    />
  </div>
);
export default NotFound;
