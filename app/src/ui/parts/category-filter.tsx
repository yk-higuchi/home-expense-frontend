"use client";

import { Select } from "@home-expense/ui";
import type { ChangeEvent, ReactElement } from "react";
import { useListNavigation } from "@/ui/parts/list-frame";
import layout from "@/ui/parts/list-layout.module.css";

interface Props {
  category: string;
}

const CategoryFilter = ({ category }: Props): ReactElement => {
  const { navigate } = useListNavigation();
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    navigate(
      `/expense-attribute?${new URLSearchParams({ category: event.currentTarget.value })}`,
    );
  };
  return (
    <div className={layout.filters}>
      <Select
        label="分類"
        className={layout.categoryFilter}
        name="category"
        defaultValue={category}
        onChange={handleChange}
      >
        <option value="固定費">固定費</option>
        <option value="変動費">変動費</option>
      </Select>
    </div>
  );
};
export default CategoryFilter;
