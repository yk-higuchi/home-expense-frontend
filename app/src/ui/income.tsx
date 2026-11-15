"use client";
import { Button, PlusIcon, Select } from "@home-expense/ui";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type ChangeEvent,
  type ReactElement,
  useEffect,
  useState,
} from "react";
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
  savedId?: string;
}

const Income = ({
  incomes,
  pagination,
  year,
  savedId,
}: Props): ReactElement => {
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  useEffect(() => {
    const { page } = pagination.current;
    if (incomes.length > 0 || page <= 1) return;
    const params = new URLSearchParams(currentSearchParams);
    params.set("page", String(page - 1));
    router.replace(`/income?${params}`);
  }, [incomes.length, pagination, currentSearchParams, router]);
  const { isPending, navigate } = useNavigation();
  const [selectedYear, setSelectedYear] = useState(year);
  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = Number(event.currentTarget.value);
    setSelectedYear(next);
    navigate(`/income?${new URLSearchParams({ year: String(next) })}`);
  };
  const handleMove = (page: number, perPage: number) => {
    const searchParams = new URLSearchParams({
      year: String(selectedYear),
      page: page.toString(),
      per_page: perPage.toString(),
    });
    navigate(`/income?${searchParams}`);
  };

  const handleRegistrationClick = (): void => {
    router.push("/income/registration");
  };

  const handleEdit = (id: string) => {
    router.push(
      `/income/${id}?${new URLSearchParams({ from: currentSearchParams.toString() })}`,
    );
  };

  return (
    <div className={layout.page}>
      <div className={layout.toolbar}>
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
        <div className={layout.actions}>
          <Button icon={<PlusIcon />} onClick={handleRegistrationClick}>
            追加
          </Button>
        </div>
      </div>
      <IncomeTable
        savedId={savedId}
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
    </div>
  );
};
export default Income;
