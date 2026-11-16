import { ButtonLink, PlusIcon } from "@home-expense/ui";
import Link from "next/link";
import type { ReactElement } from "react";
import type { ExpenseAttributes } from "@/lib/expense-attribute";
import CategoryFilter from "@/ui/parts/category-filter";
import ExpenseAttributeTable from "@/ui/parts/expense-attribute-table";
import ListFrame from "@/ui/parts/list-frame";
import layout from "@/ui/parts/list-layout.module.css";
import { LoadFailed } from "@/ui/parts/load-failed";
import {
  ErrorTable,
  EXPENSE_ATTRIBUTE_COLUMNS,
} from "@/ui/parts/table-columns";

interface Props {
  category: string;
  list: { expenseAttributes: ExpenseAttributes; version: string } | null;
  savedId?: string;
}

const ExpenseAttribute = ({ category, list, savedId }: Props): ReactElement => (
  <ListFrame>
    <div className={layout.toolbar}>
      <CategoryFilter category={category} />
      <div className={layout.actions}>
        <ButtonLink
          href="/expense-attribute/registration"
          icon={<PlusIcon />}
          linkComponent={Link}
        >
          追加
        </ButtonLink>
      </div>
    </div>
    {list === null ? (
      <ErrorTable columns={EXPENSE_ATTRIBUTE_COLUMNS}>
        <LoadFailed />
      </ErrorTable>
    ) : (
      <ExpenseAttributeTable
        savedId={savedId}
        expenseAttributes={list.expenseAttributes}
        version={list.version}
        category={category}
      />
    )}
  </ListFrame>
);
export default ExpenseAttribute;
