import {
  Amount,
  BarList,
  Breakdown,
  BreakdownGroup,
  BreakdownItem,
  Card,
  SummaryList,
  SummaryRow,
} from "@home-expense/ui";
import type { ReactElement } from "react";
import type { BalanceStatistics } from "@/core/balance";
import { LoadFailed } from "@/ui/parts/load-failed";
import PeriodFilterFrame from "@/ui/parts/period-filter-frame";
import style from "./expense-aggregate.module.css";

const EXPENSE_SERIES = [
  { id: "fixed", label: "固定費", color: "var(--color-chart-fixed)" },
  { id: "variable", label: "変動費", color: "var(--color-chart-variable)" },
];

interface Props {
  year: number;
  month: number;
  statistics: BalanceStatistics | null;
}

const ExpenseAggregate = ({ year, month, statistics }: Props): ReactElement => {
  const classes = {
    page: style.page,
    content: style.content,
    pending: style.pending,
  };
  if (statistics === null) {
    return (
      <PeriodFilterFrame
        path="/home"
        year={year}
        month={month}
        classes={classes}
      >
        <LoadFailed />
      </PeriodFilterFrame>
    );
  }
  const { income, fixedExpense, variableExpense, expenseTotal, net } =
    statistics;
  const ranking = [
    ...fixedExpense.items.map((item) => ({ ...item, series: "fixed" })),
    ...variableExpense.items.map((item) => ({ ...item, series: "variable" })),
  ]
    .filter(({ amount }) => amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map(({ id, name, amount, series }) => ({
      id,
      label: name,
      value: amount,
      series,
    }));
  return (
    <PeriodFilterFrame path="/home" year={year} month={month} classes={classes}>
      <div className={style.main}>
        <SummaryList>
          <SummaryRow
            label="収入合計"
            amount={<Amount value={income.total} />}
          />
          <SummaryRow
            label="支出合計"
            amount={<Amount value={expenseTotal} />}
          />
          <SummaryRow label="収支合計" amount={<Amount value={net} />} />
        </SummaryList>
        <SummaryRow label="内訳" />
        <Breakdown className={style.breakdown}>
          <BreakdownGroup
            label="固定費"
            defaultOpen={false}
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
            defaultOpen={false}
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
      <Card title="支出の多い順" className={style.ranking}>
        <section
          className={style.rankingScroll}
          aria-label="支出の多い順の一覧"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: 中だけスクロールする領域を、キーボードでもスクロールできるようにする
          tabIndex={0}
        >
          <BarList
            items={ranking}
            total={expenseTotal}
            series={EXPENSE_SERIES}
            empty="この月の支出はありません"
          />
        </section>
      </Card>
    </PeriodFilterFrame>
  );
};
export default ExpenseAggregate;
