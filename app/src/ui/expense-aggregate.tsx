"use client";

import {
  Amount,
  Breakdown,
  BreakdownGroup,
  BreakdownItem,
  Select,
  SummaryList,
  SummaryRow,
} from "@home-expense/ui";
import { type ChangeEvent, type ReactElement, useState } from "react";
import type { BalanceStatistics } from "@/lib/balance";
import { useNavigation } from "@/lib/hooks/use-navigation";
import layout from "@/ui/parts/list-layout.module.css";
import { MONTHS, YEARS } from "@/ui/parts/year-month-options";
import style from "./expense-aggregate.module.css";

interface Props {
  year: number;
  month: number;
  /** その月の収支 */
  statistics: BalanceStatistics;
}

/** HOME（Figma: HOME） */
const ExpenseAggregate = ({ year, month, statistics }: Props): ReactElement => {
  const { isPending, navigate } = useNavigation();
  // 経費一覧の絞り込みと同じ「年」「月」のプルダウン（月ごとの集計なので「すべて」はない）
  const [selected, setSelected] = useState({ year, month });
  const changeTo = (next: { year: number; month: number }) => {
    setSelected(next);
    navigate(
      `/home?${new URLSearchParams({ year: String(next.year), month: String(next.month) })}`,
    );
  };
  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
    changeTo({ ...selected, year: Number(event.currentTarget.value) });
  };
  const handleMonthChange = (event: ChangeEvent<HTMLSelectElement>) => {
    changeTo({ ...selected, month: Number(event.currentTarget.value) });
  };
  const { income, fixedExpense, variableExpense, expenseTotal, net } =
    statistics;
  return (
    <div className={style.page} aria-busy={isPending || undefined}>
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
      </div>
      <div className={isPending ? style.pending : style.content}>
        <SummaryList>
          <SummaryRow
            label="収入合計"
            amount={<Amount value={income.total} />}
          />
          <SummaryRow
            label="支出合計"
            amount={<Amount value={expenseTotal} />}
          />
          <SummaryRow label="収入 − 支出" amount={<Amount value={net} />} />
        </SummaryList>
        <SummaryRow label="内訳" />
        <Breakdown className={style.breakdown}>
          <BreakdownGroup
            label="固定費"
            amount={<Amount value={fixedExpense.total} />}
          >
            {fixedExpense.items.map(({ id, name, amount }) => (
              <BreakdownItem
                key={id}
                name={name}
                amount={<Amount value={amount} />}
              />
            ))}
          </BreakdownGroup>
          <BreakdownGroup
            label="変動費"
            amount={<Amount value={variableExpense.total} />}
          >
            {variableExpense.items.map(({ id, name, amount }) => (
              <BreakdownItem
                key={id}
                name={name}
                amount={<Amount value={amount} />}
              />
            ))}
          </BreakdownGroup>
        </Breakdown>
      </div>
    </div>
  );
};
export default ExpenseAggregate;
