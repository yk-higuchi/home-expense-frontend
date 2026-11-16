"use client";

import { Select } from "@home-expense/ui";
import {
  type ChangeEvent,
  type ReactElement,
  type ReactNode,
  useState,
} from "react";
import { useNavigation } from "@/ui/hooks/use-navigation";
import layout from "@/ui/parts/list-layout.module.css";
import { MONTHS, YEARS } from "@/ui/parts/year-month-options";

interface Props {
  path: string;
  year: number;
  month?: number;
  classes: { page: string; content: string; pending: string };
  children: ReactNode;
}

const PeriodFilterFrame = ({
  path,
  year,
  month,
  classes,
  children,
}: Props): ReactElement => {
  const { isPending, navigate } = useNavigation();
  const [selected, setSelected] = useState({ year, month });
  const changeTo = (next: { year: number; month: number | undefined }) => {
    setSelected(next);
    const params = new URLSearchParams({ year: String(next.year) });
    if (next.month !== undefined) params.set("month", String(next.month));
    navigate(`${path}?${params}`);
  };
  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
    changeTo({ ...selected, year: Number(event.currentTarget.value) });
  };
  const handleMonthChange = (event: ChangeEvent<HTMLSelectElement>) => {
    changeTo({ ...selected, month: Number(event.currentTarget.value) });
  };
  return (
    <div className={classes.page} aria-busy={isPending || undefined}>
      <div className={layout.filters}>
        <Select
          label="年"
          className={layout.yearFilter}
          name="year"
          value={selected.year}
          onChange={handleYearChange}
        >
          {YEARS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        {selected.month !== undefined && (
          <Select
            label="月"
            className={layout.monthFilter}
            name="month"
            value={selected.month}
            onChange={handleMonthChange}
          >
            {MONTHS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        )}
      </div>
      <div className={isPending ? classes.pending : classes.content}>
        {children}
      </div>
    </div>
  );
};
export default PeriodFilterFrame;
