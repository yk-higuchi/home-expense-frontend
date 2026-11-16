"use client";

import { Select } from "@home-expense/ui";
import { type ChangeEvent, type ReactElement, useState } from "react";
import { useListNavigation } from "@/ui/parts/list-frame";
import layout from "@/ui/parts/list-layout.module.css";
import { YEARS } from "@/ui/parts/year-month-options";

interface Props {
  path: string;
  year: number;
}

const YearFilter = ({ path, year }: Props): ReactElement => {
  const { navigate } = useListNavigation();
  const [selected, setSelected] = useState(year);
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = Number(event.currentTarget.value);
    setSelected(next);
    navigate(`${path}?${new URLSearchParams({ year: String(next) })}`);
  };
  return (
    <div className={layout.filters}>
      <Select
        label="年"
        className={layout.yearFilter}
        name="year"
        value={selected}
        onChange={handleChange}
      >
        {YEARS.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </Select>
    </div>
  );
};
export default YearFilter;
