import { ButtonLink, PlusIcon } from "@home-expense/ui";
import Link from "next/link";
import type { ReactElement } from "react";
import type { IncomeAttributes } from "@/lib/income-attribute";
import IncomeAttributeTable from "@/ui/parts/income-attribute-table";
import ListFrame from "@/ui/parts/list-frame";
import layout from "@/ui/parts/list-layout.module.css";
import { LoadFailed } from "@/ui/parts/load-failed";
import { ErrorTable, INCOME_ATTRIBUTE_COLUMNS } from "@/ui/parts/table-columns";

interface Props {
  list: { incomeAttributes: IncomeAttributes; version: string } | null;
  savedId?: string;
}

const IncomeAttribute = ({ list, savedId }: Props): ReactElement => (
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
    {list === null ? (
      <ErrorTable columns={INCOME_ATTRIBUTE_COLUMNS}>
        <LoadFailed />
      </ErrorTable>
    ) : (
      <IncomeAttributeTable
        savedId={savedId}
        incomeAttributes={list.incomeAttributes}
        version={list.version}
      />
    )}
  </ListFrame>
);
export default IncomeAttribute;
