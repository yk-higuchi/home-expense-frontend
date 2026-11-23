"use client";

import { Select } from "@home-expense/ui";
import { type ChangeEvent, type ReactElement, useOptimistic } from "react";
import { useListNavigation } from "@/ui/parts/list-frame";
import layout from "@/ui/parts/list-layout.module.css";

interface Props {
  category: string;
}

const CategoryFilter = ({ category }: Props): ReactElement => {
  const { navigate } = useListNavigation();
  const [selected, setSelected] = useOptimistic(category);
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.currentTarget.value;
    navigate(
      `/expense-attribute?${new URLSearchParams({ category: next })}`,
      () => setSelected(next),
    );
  };
  return (
    <div className={layout.filters}>
      <Select
        label="分類"
        className={layout.categoryFilter}
        name="category"
        value={selected}
        onChange={handleChange}
      >
        <option value="固定費">固定費</option>
        <option value="変動費">変動費</option>
      </Select>
    </div>
  );
};
export default CategoryFilter;
