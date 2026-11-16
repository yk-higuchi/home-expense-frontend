import { ButtonLink, PlusIcon } from "@home-expense/ui";
import Link from "next/link";
import type { ReactElement } from "react";
import type { Expenses } from "@/lib/expense";
import type {
  ExpenseAttributeCategory,
  ExpenseAttributes,
} from "@/lib/expense-attribute";
import type { Pagination } from "@/lib/pagination/pagination";
import ExpenseFilters from "@/ui/parts/expense-filters";
import ExpenseTable from "@/ui/parts/expense-table";
import ListFrame from "@/ui/parts/list-frame";
import layout from "@/ui/parts/list-layout.module.css";
import { LoadFailed } from "@/ui/parts/load-failed";
import PaginationComponent from "@/ui/parts/pagination-component";
import { ErrorTable, EXPENSE_COLUMNS } from "@/ui/parts/table-columns";

interface Props {
  list: { expenses: Expenses; pagination: Pagination } | null;
  year: number;
  month?: number;
  category?: ExpenseAttributeCategory;
  expenseAttributes: ExpenseAttributes;
  attributeId?: string;
  savedId?: string;
}

const Expense = ({
  list,
  year,
  month,
  category,
  expenseAttributes,
  attributeId,
  savedId,
}: Props): ReactElement => {
  const query: Record<string, string> = { year: String(year) };
  if (month !== undefined) query.month = String(month);
  if (category !== undefined) query.category = category;
  if (attributeId !== undefined) query.attributeId = attributeId;
  return (
    <ListFrame>
      <div className={layout.toolbar}>
        <ExpenseFilters
          year={year}
          month={month}
          category={category}
          attributeId={attributeId}
          expenseAttributes={expenseAttributes}
        />
        <div className={layout.actions}>
          <ButtonLink
            href="/expense/registration"
            icon={<PlusIcon />}
            linkComponent={Link}
          >
            追加
          </ButtonLink>
        </div>
      </div>
      {list === null ? (
        <ErrorTable columns={EXPENSE_COLUMNS}>
          <LoadFailed />
        </ErrorTable>
      ) : (
        <ExpenseTable
          savedId={savedId}
          expenses={list.expenses}
          pagination={list.pagination}
          footer={
            <PaginationComponent
              pagination={list.pagination}
              path="/expense"
              query={query}
            />
          }
        />
      )}
    </ListFrame>
  );
};
export default Expense;
