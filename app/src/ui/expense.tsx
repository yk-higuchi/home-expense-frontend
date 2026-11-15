"use client";
import { Button, PlusIcon, Select } from "@home-expense/ui";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type ReactElement, useState } from "react";
import type { Expenses } from "@/lib/expense";
import {
  type ExpenseAttributeCategory,
  type ExpenseAttributes,
  isExpenseAttributeCategory,
} from "@/lib/expense-attribute";
import { useNavigation } from "@/lib/hooks/use-navigation";
import type { Pagination } from "@/lib/pagination/pagination";
import ExpenseTable from "@/ui/parts/expense-table";
import layout from "@/ui/parts/list-layout.module.css";
import PaginationComponent from "@/ui/parts/pagination-component";
import { MONTHS, YEARS } from "@/ui/parts/year-month-options";

interface Props {
  expenses: Expenses;
  pagination: Pagination;
  year?: number;
  month?: number;
  category?: ExpenseAttributeCategory;
  expenseAttributes: ExpenseAttributes;
  attributeId?: string;
}

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
  const { isPending, navigate } = useNavigation();

  const [queryParam, setQueryParam] = useState({
    ...(year && { year: year.toString() }),
    ...(month && { month: month.toString() }),
    ...(category && { category }),
    ...(attributeId && { attributeId }),
  });

  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
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
    navigate(`/expense?${searchParams}`);
  };

  const handleMonthChange = (event: ChangeEvent<HTMLSelectElement>) => {
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
    navigate(`/expense?${searchParams}`);
  };

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
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
      navigate(`/expense?${searchParams}`);
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
    setQueryParam(_query);
    navigate(`/expense?${searchParams}`);
  };

  const handleAttributeIdChange = (event: ChangeEvent<HTMLSelectElement>) => {
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
    navigate(`/expense?${searchParams}`);
  };

  const handleMovePrevious = (page: number, perPage: number) => {
    const _query = {
      ...queryParam,
      page: page.toString(),
      per_page: perPage.toString(),
    };
    const searchParams = new URLSearchParams(_query);
    setQueryParam(_query);
    navigate(`/expense?${searchParams.toString()}`);
  };

  const handleMoveNext = (page: number, perPage: number) => {
    const _query = {
      ...queryParam,
      page: page.toString(),
      per_page: perPage.toString(),
    };
    const searchParams = new URLSearchParams(_query);
    setQueryParam(_query);
    navigate(`/expense?${searchParams.toString()}`);
  };

  const handleMovePage = (page: number, perPage: number) => {
    const _query = {
      ...queryParam,
      page: page.toString(),
      per_page: perPage.toString(),
    };
    const searchParams = new URLSearchParams(_query);
    setQueryParam(_query);
    navigate(`/expense?${searchParams.toString()}`);
  };

  const handleRegistrationClick = (): void => {
    router.push("/expense/registration");
  };

  const handleEdit = (id: string) => {
    router.push(`/expense/${id}`);
  };

  return (
    <div className={layout.page}>
      <div className={layout.toolbar}>
        <div className={layout.filters}>
          <Select
            label="年"
            className={layout.yearFilter}
            name="year"
            value={queryParam.year}
            onChange={handleYearChange}
          >
            {YEARS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
          <Select
            label="月"
            className={layout.monthFilter}
            name="month"
            value={queryParam.month}
            onChange={handleMonthChange}
          >
            <option value="">すべて</option>
            {MONTHS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
          <Select
            label="分類"
            className={layout.categoryFilter}
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
            className={layout.attributeFilter}
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
        <div className={layout.actions}>
          <Button icon={<PlusIcon />} onClick={handleRegistrationClick}>
            追加
          </Button>
        </div>
      </div>
      <ExpenseTable
        loading={isPending}
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
    </div>
  );
};
export default Expense;
