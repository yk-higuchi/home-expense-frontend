import { ButtonLink, PlusIcon } from "@home-expense/ui";
import Link from "next/link";
import type { ReactElement } from "react";
import type { Incomes } from "@/lib/income";
import type { Pagination } from "@/lib/pagination/pagination";
import IncomeTable from "@/ui/parts/income-table";
import ListFrame from "@/ui/parts/list-frame";
import layout from "@/ui/parts/list-layout.module.css";
import PaginationComponent from "@/ui/parts/pagination-component";
import YearFilter from "@/ui/parts/year-filter";

interface Props {
  incomes: Incomes;
  pagination: Pagination;
  year: number;
  savedId?: string;
}

const Income = ({
  incomes,
  pagination,
  year,
  savedId,
}: Props): ReactElement => (
  <ListFrame>
    <div className={layout.toolbar}>
      <YearFilter path="/income" year={year} />
      <div className={layout.actions}>
        <ButtonLink
          href="/income/registration"
          icon={<PlusIcon />}
          linkComponent={Link}
        >
          追加
        </ButtonLink>
      </div>
    </div>
    <IncomeTable
      savedId={savedId}
      incomes={incomes}
      pagination={pagination}
      footer={
        <PaginationComponent
          pagination={pagination}
          path="/income"
          query={{ year: String(year) }}
        />
      }
    />
  </ListFrame>
);
export default Income;
