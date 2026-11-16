"use client";

import { Select } from "@home-expense/ui";
import { type ChangeEvent, type ReactElement, useState } from "react";
import {
  type ExpenseAttributeCategory,
  type ExpenseAttributes,
  isExpenseAttributeCategory,
} from "@/core/expense-attribute";
import { useListNavigation } from "@/ui/parts/list-frame";
import layout from "@/ui/parts/list-layout.module.css";
import { MONTHS, YEARS } from "@/ui/parts/year-month-options";

interface Props {
  year: number;
  month?: number;
  category?: ExpenseAttributeCategory;
  attributeId?: string;
  expenseAttributes: ExpenseAttributes;
}

interface Query {
  year: string;
  month?: string;
  category?: string;
  attributeId?: string;
}

const toSearchParams = (query: Query): URLSearchParams =>
  new URLSearchParams(
    Object.entries(query).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  );

const ExpenseFilters = ({
  year,
  month,
  category,
  attributeId,
  expenseAttributes,
}: Props): ReactElement => {
  const { navigate } = useListNavigation();
  const [query, setQuery] = useState<Query>({
    year: String(year),
    month: month === undefined ? undefined : String(month),
    category,
    attributeId,
  });
  const change = (next: Query): void => {
    setQuery(next);
    navigate(`/expense?${toSearchParams(next)}`);
  };
  const optional = (value: string): string | undefined =>
    value === "" ? undefined : value;

  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) =>
    change({ ...query, year: event.currentTarget.value });
  const handleMonthChange = (event: ChangeEvent<HTMLSelectElement>) =>
    change({ ...query, month: optional(event.currentTarget.value) });
  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.currentTarget.value;
    change(
      isExpenseAttributeCategory(value)
        ? { ...query, category: value }
        : { ...query, category: undefined, attributeId: undefined },
    );
  };
  const handleAttributeIdChange = (event: ChangeEvent<HTMLSelectElement>) =>
    change({ ...query, attributeId: optional(event.currentTarget.value) });

  return (
    <div className={layout.filters}>
      <Select
        label="年"
        className={layout.yearFilter}
        name="year"
        value={query.year}
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
        value={query.month ?? ""}
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
        defaultValue={query.category}
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
        defaultValue={query.attributeId}
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
  );
};
export default ExpenseFilters;
