"use client";

import {
  Amount,
  Breakdown,
  BreakdownGroup,
  BreakdownItem,
  SummaryList,
  SummaryRow,
  TextInput,
} from "@home-expense/ui";
import { type ChangeEvent, type ReactElement, useState } from "react";
import type { BalancePoint, BalanceStatistics } from "@/lib/balance";
import { useNavigation } from "@/lib/hooks/use-navigation";
import BalanceChart from "@/ui/parts/balance-chart";
import style from "./expense-aggregate.module.css";

interface Props {
  year: number;
  month: number;
  /** その月の収支 */
  statistics: BalanceStatistics;
  /** 直近 12 か月の推移 */
  series: BalancePoint[];
}

/** HOME（Figma: HOME） */
const ExpenseAggregate = ({
  year,
  month,
  statistics,
  series,
}: Props): ReactElement => {
  const { isPending, navigate } = useNavigation();
  const [yearMonth, setYearMonth] = useState(
    `${year}-${String(month).padStart(2, "0")}`,
  );
  const handleYearMonthChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    if (!value) return;
    const [y, m] = value.split("-");
    setYearMonth(value);
    navigate(
      `/home?${new URLSearchParams({ year: y ?? "", month: String(Number(m)) })}`,
    );
  };
  const { income, fixedExpense, variableExpense, expenseTotal, net } =
    statistics;
  return (
    <div className={style.page} aria-busy={isPending || undefined}>
      <TextInput
        aria-label="年月"
        className={style.yearMonth}
        type="month"
        value={yearMonth}
        onChange={handleYearMonthChange}
      />
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
        <BalanceChart title="直近 12 か月の推移" points={series} />
        <SummaryRow label="内訳" />
        <Breakdown>
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
