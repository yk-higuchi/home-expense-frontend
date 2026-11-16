import { ButtonLink, PlusIcon } from "@home-expense/ui";
import Link from "next/link";
import type { ReactElement } from "react";
import type { IncomeAttributes } from "@/lib/income-attribute";
import IncomeAttributeTable from "@/ui/parts/income-attribute-table";
import ListFrame from "@/ui/parts/list-frame";
import layout from "@/ui/parts/list-layout.module.css";

interface Props {
  incomeAttributes: IncomeAttributes;
  version: string;
  savedId?: string;
}

const IncomeAttribute = ({
  incomeAttributes,
  version,
  savedId,
}: Props): ReactElement => (
  <ListFrame>
    <div className={layout.actions}>
      <ButtonLink
        href="/income-attribute/registration"
        icon={<PlusIcon />}
        linkComponent={Link}
      >
        追加
      </ButtonLink>
    </div>
    <IncomeAttributeTable
      savedId={savedId}
      incomeAttributes={incomeAttributes}
      version={version}
    />
  </ListFrame>
);
export default IncomeAttribute;
