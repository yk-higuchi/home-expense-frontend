"use client";
import { Button, PlusIcon, Select } from "@home-expense/ui";
import { useRouter } from "next/navigation";
import type React from "react";
import {
  type ChangeEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import type { Expenses } from "@/lib/expense";
import {
  type ExpenseAttributeCategory,
  type ExpenseAttributes,
  isExpenseAttributeCategory,
} from "@/lib/expense-attribute";
import type { Pagination } from "@/lib/pagination/pagination";
import ExpenseTable from "@/ui/parts/expense-table";
import layout from "@/ui/parts/list-layout.module.css";
import PaginationComponent from "@/ui/parts/pagination-component";

interface Props {
  expenses: Expenses;
  pagination: Pagination;
  year?: number;
  month?: number;
  category?: ExpenseAttributeCategory;
  expenseAttributes: ExpenseAttributes;
  attributeId?: string;
}

const generateYearArray = () => {
  const years: number[] = [];
  for (let i = 2000; i <= 2100; i++) {
    years.push(i);
  }
  return years;
};

const generateMonthArray = () => {
  const months = [];
  for (let i = 1; i <= 12; i++) {
    months.push(i);
  }
  return months;
};

/** 値が undefined の項目を取り除く（クエリ文字列を作る前に使う） */
const cleanUpObject = (obj: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Record<string, string>;

const Expense = ({
  expenses,
  pagination,
  year,
  month,
  category,
  expenseAttributes,
  attributeId,
}: Props): ReactElement => {
  const router = useRouter();

  const [queryParam, setQueryParam] = useState({
    ...(year && { year: year.toString() }),
    ...(month && { month: month.toString() }),
    ...(category && { category }),
    ...(attributeId && { attributeId }),
  });

  useEffect(() => {
    router.refresh();
  }, [router]);

  const handleYearChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const year = event.currentTarget.value;
      const _query = {
        ...queryParam,
        year,
        page: undefined,
        per_page: undefined,
      };
      setQueryParam(cleanUpObject(_query));
      const searchParams = new URLSearchParams({
        ...cleanUpObject(_query),
      }).toString();
      router.push(`/expense?${searchParams}`);
    },
    [router, queryParam],
  );

  const handleMonthChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const month = event.currentTarget.value;
      const _query = cleanUpObject({
        ...queryParam,
        ...(month !== "" ? { month } : { month: undefined }),
        page: undefined,
        per_page: undefined,
      });
      setQueryParam(_query);
      const searchParams = new URLSearchParams({
        ..._query,
      }).toString();
      router.push(`/expense?${searchParams}`);
    },
    [router, queryParam],
  );

  const handleCategoryChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const _category = event.currentTarget.value;
      if (isExpenseAttributeCategory(_category)) {
        const _query = cleanUpObject({
          ...queryParam,
          category: _category,
          page: undefined,
          per_page: undefined,
        });
        const searchParams = new URLSearchParams(_query).toString();
        setQueryParam(_query);
        router.push(`/expense?${searchParams}`);
        return;
      }
      const _query = cleanUpObject({
        ...queryParam,
        category: undefined,
        attributeId: undefined,
        page: undefined,
        per_page: undefined,
      });
      const searchParams = new URLSearchParams(_query).toString();
      router.push(`/expense?${searchParams}`);
    },
    [router, queryParam],
  );

  const handleAttributeIdChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const attributeId = event.currentTarget.value;
      const _query = cleanUpObject({
        ...queryParam,
        ...(attributeId !== "" ? { attributeId } : { attributeId: undefined }),
        page: undefined,
        per_page: undefined,
      });
      const searchParams = new URLSearchParams({
        ..._query,
      }).toString();
      setQueryParam(_query);
      router.push(`/expense?${searchParams}`);
    },
    [router, queryParam],
  );

  const handleMovePrevious = useCallback(
    (page: number, perPage: number) => {
      const _query = {
        ...queryParam,
        page: page.toString(),
        per_page: perPage.toString(),
      };
      const searchParams = new URLSearchParams(_query);
      setQueryParam(_query);
      router.push(`/expense?${searchParams.toString()}`);
    },
    [router, queryParam],
  );

  const handleMoveNext = useCallback(
    (page: number, perPage: number) => {
      const _query = {
        ...queryParam,
        page: page.toString(),
        per_page: perPage.toString(),
      };
      const searchParams = new URLSearchParams(_query);
      setQueryParam(_query);
      router.push(`/expense?${searchParams.toString()}`);
    },
    [router, queryParam],
  );

  const handleMovePage = useCallback(
    (page: number, perPage: number) => {
      const _query = {
        ...queryParam,
        page: page.toString(),
        per_page: perPage.toString(),
      };
      const searchParams = new URLSearchParams(_query);
      setQueryParam(_query);
      router.push(`/expense?${searchParams.toString()}`);
    },
    [router, queryParam],
  );

  const handleRegistrationClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      console.log(event);
      router.push("/expense/registration");
    },
    [router],
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/expense/${id}`);
    },
    [router],
  );

  return (
    <div className={layout.page}>
      <div className={layout.filters}>
        <Select
          label="年"
          className={layout.narrow}
          name="year"
          value={queryParam.year}
          onChange={handleYearChange}
        >
          {generateYearArray().map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        <Select
          label="月"
          className={layout.narrow}
          name="month"
          value={queryParam.month}
          onChange={handleMonthChange}
        >
          <option value="">すべて</option>
          {generateMonthArray().map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        <Select
          label="分類"
          className={layout.medium}
          name="category"
          defaultValue={queryParam.category}
          onChange={handleCategoryChange}
        >
          <option value="">すべて</option>
          <option value="固定費">固定費</option>
          <option value="変動費">変動費</option>
        </Select>
        <Select
          label="属性名"
          className={layout.wide}
          name="attributeId"
          defaultValue={queryParam.attributeId}
          onChange={handleAttributeIdChange}
        >
          <option value="">すべて</option>
          {expenseAttributes.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </Select>
      </div>
      <ExpenseTable
        expenses={expenses}
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
export default Expense;
