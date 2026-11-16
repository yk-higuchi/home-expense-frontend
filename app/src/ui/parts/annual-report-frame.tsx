"use client";

import { Select } from "@home-expense/ui";
import type { ChangeEvent, ReactElement, ReactNode } from "react";
import { useNavigation } from "@/lib/hooks/use-navigation";
import style from "@/ui/annual-report.module.css";
import layout from "@/ui/parts/list-layout.module.css";
import { YEARS } from "@/ui/parts/year-month-options";

interface Props {
  year: number;
  children: ReactNode;
}

const AnnualReportFrame = ({ year, children }: Props): ReactElement => {
  const { isPending, navigate } = useNavigation();
  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
    navigate(
      `/annual-report?${new URLSearchParams({ year: event.currentTarget.value })}`,
    );
  };
  return (
    <div className={style.page} aria-busy={isPending || undefined}>
      <div className={layout.filters}>
        <Select
          label="年"
          className={layout.yearFilter}
          name="year"
          value={year}
          onChange={handleYearChange}
        >
          {YEARS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
      </div>
      <div className={isPending ? style.pending : style.content}>
        {children}
      </div>
    </div>
  );
};
export default AnnualReportFrame;
