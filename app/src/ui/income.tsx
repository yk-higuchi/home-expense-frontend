"use client";
import { Button, PlusIcon, TextInput } from "@home-expense/ui";
import { useRouter } from "next/navigation";
import type React from "react";
import {
  type ChangeEvent,
  type ReactElement,
  useCallback,
  useState,
} from "react";
import { useNavigation } from "@/lib/hooks/use-navigation";

import type { Incomes } from "@/lib/income";
import type { Pagination } from "@/lib/pagination/pagination";
import IncomeTable from "@/ui/parts/income-table";
import layout from "@/ui/parts/list-layout.module.css";
import PaginationComponent from "@/ui/parts/pagination-component";

interface Props {
  incomes: Incomes;
  pagination: Pagination;
  year: number;
}

const Income = ({ incomes, pagination, year }: Props): ReactElement => {
  const router = useRouter();
  const { isPending, navigate } = useNavigation();
  const formattedYear = year.toString();
  const [displayYear, setDisplayYear] = useState(formattedYear);
  const handleYearChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const date = new Date(event.currentTarget.value);
      const year = date.getFullYear().toString();
      const searchParams = new URLSearchParams({
        year: year,
      }).toString();
      setDisplayYear(year);
      navigate(`/income?${searchParams}`);
    },
    [navigate],
  );
  const handleMovePrevious = useCallback(
    (page: number, perPage: number) => {
      const date = new Date(displayYear);
      const searchParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        year: date.getFullYear().toString(),
      });
      navigate(`/income?${searchParams.toString()}`);
    },
    [displayYear, navigate],
  );

  const handleMoveNext = useCallback(
    (page: number, perPage: number) => {
      const date = new Date(displayYear);
      const searchParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        year: date.getFullYear().toString(),
      });
      navigate(`/income?${searchParams.toString()}`);
    },
    [displayYear, navigate],
  );

  const handleMovePage = useCallback(
    (page: number, perPage: number) => {
      const date = new Date(displayYear);
      const searchParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        year: date.getFullYear().toString(),
      });
      navigate(`/income?${searchParams.toString()}`);
    },
    [displayYear, navigate],
  );

  const handleRegistrationClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      console.log(event);
      router.push("/income/registration");
    },
    [router],
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/income/${id}`);
    },
    [router],
  );

  return (
    <div className={layout.page}>
      <div className={layout.filters}>
        <TextInput
          label="年"
          className={layout.narrow}
          type="number"
          min="1900"
          max="2099"
          step="1"
          value={displayYear}
          onChange={handleYearChange}
        />
      </div>
      <IncomeTable
        loading={isPending}
        incomes={incomes}
        pagination={pagination}
        onEdit={handleEdit}
        footer={
          <PaginationComponent
            pagination={pagination}
            onMovePrevious={handleMovePrevious}
            onMoveNext={handleMoveNext}
            onMovePage={handleMovePage}
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
