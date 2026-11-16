import { ButtonLink, LoadError } from "@home-expense/ui";
import Link from "next/link";
import type { ReactElement } from "react";
import style from "./state.module.css";

const NotFound = (): ReactElement => (
  <div className={style.state}>
    <LoadError
      message="ページが見つかりませんでした。URL をお確かめください。"
      action={
        <ButtonLink href="/home" linkComponent={Link}>
          HOME に戻る
        </ButtonLink>
      }
    />
  </div>
);
export default NotFound;
