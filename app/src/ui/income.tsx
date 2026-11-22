import { ButtonLink, PlusIcon } from "@home-expense/ui";
import Link from "next/link";
import type { ReactElement } from "react";
import type { Incomes } from "@/core/income";
import type { Pagination } from "@/core/pagination";
import IncomeTable from "@/ui/parts/income-table";
import ListFrame from "@/ui/parts/list-frame";
import layout from "@/ui/parts/list-layout.module.css";
import { LoadFailed } from "@/ui/parts/load-failed";
import PaginationComponent from "@/ui/parts/pagination-component";
import { ErrorTable, INCOME_COLUMNS } from "@/ui/parts/table-columns";
import YearFilter from "@/ui/parts/year-filter";

interface Props {
  list: { incomes: Incomes; pagination: Pagination } | null;
  year: number;
  savedId?: string;
}

const Income = ({ list, year, savedId }: Props): ReactElement => (
  <ListFrame>
    <div className={layout.toolbar}>
      <YearFilter path="/income" year={year} />
      <div className={layout.actions}>
        <ButtonLink
          href={`/income/registration?${new URLSearchParams({ from: new URLSearchParams({ year: String(year) }).toString() })}`}
          icon={<PlusIcon />}
          linkComponent={Link}
        >
          追加
        </ButtonLink>
      </div>
    </div>
    {list === null ? (
      <ErrorTable columns={INCOME_COLUMNS}>
        <LoadFailed />
      </ErrorTable>
    ) : (
      <IncomeTable
        savedId={savedId}
        incomes={list.incomes}
        pagination={list.pagination}
        footer={
          <PaginationComponent
            pagination={list.pagination}
            path="/income"
            query={{ year: String(year) }}
          />
        }
      />
    )}
  </ListFrame>
);
export default Income;
