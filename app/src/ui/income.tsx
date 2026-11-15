"use client";
import { Button, PlusIcon, Select } from "@home-expense/ui";
import { useRouter } from "next/navigation";
import type React from "react";
import { type ChangeEvent, type ReactElement, useState } from "react";
import { useNavigation } from "@/lib/hooks/use-navigation";

import type { Incomes } from "@/lib/income";
import type { Pagination } from "@/lib/pagination/pagination";
import IncomeTable from "@/ui/parts/income-table";
import layout from "@/ui/parts/list-layout.module.css";
import PaginationComponent from "@/ui/parts/pagination-component";
import { YEARS } from "@/ui/parts/year-month-options";

interface Props {
  incomes: Incomes;
  pagination: Pagination;
  year: number;
}

const Income = ({ incomes, pagination, year }: Props): ReactElement => {
  const router = useRouter();
  const { isPending, navigate } = useNavigation();
  const [selectedYear, setSelectedYear] = useState(year);
  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = Number(event.currentTarget.value);
    setSelectedYear(next);
    navigate(`/income?${new URLSearchParams({ year: String(next) })}`);
  };
  /** ページ送り（選んでいる年を保ったまま） */
  const handleMove = (page: number, perPage: number) => {
    const searchParams = new URLSearchParams({
      year: String(selectedYear),
      page: page.toString(),
      per_page: perPage.toString(),
    });
    navigate(`/income?${searchParams}`);
  };

  const handleRegistrationClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    console.log(event);
    router.push("/income/registration");
  };

  const handleEdit = (id: string) => {
    router.push(`/income/${id}`);
  };

  return (
    <div className={layout.page}>
      <div className={layout.filters}>
        <Select
          label="年"
          className={layout.yearFilter}
          name="year"
          value={selectedYear}
          onChange={handleYearChange}
        >
          {YEARS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
      </div>
      <IncomeTable
        loading={isPending}
        incomes={incomes}
        pagination={pagination}
        onEdit={handleEdit}
        footer={
          <PaginationComponent
            pagination={pagination}
            onMovePrevious={handleMove}
            onMoveNext={handleMove}
            onMovePage={handleMove}
          />
        }
      />
      <div className={layout.actions}>
        <Button icon={<PlusIcon />} onClick={handleRegistrationClick}>
          追加
        </Button>
      </div>
    </div>
  );
};
export default Income;
