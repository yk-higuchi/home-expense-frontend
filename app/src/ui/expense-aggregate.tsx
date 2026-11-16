import {
  Amount,
  Breakdown,
  BreakdownGroup,
  BreakdownItem,
  SummaryList,
  SummaryRow,
} from "@home-expense/ui";
import type { ReactElement } from "react";
import type { BalanceStatistics } from "@/lib/balance";
import { LoadFailed } from "@/ui/parts/load-failed";
import PeriodFilterFrame from "@/ui/parts/period-filter-frame";
import style from "./expense-aggregate.module.css";

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
  return (
    <PeriodFilterFrame path="/home" year={year} month={month} classes={classes}>
      <SummaryList>
        <SummaryRow label="収入合計" amount={<Amount value={income.total} />} />
        <SummaryRow label="支出合計" amount={<Amount value={expenseTotal} />} />
        <SummaryRow label="収支合計" amount={<Amount value={net} />} />
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
    </PeriodFilterFrame>
  );
};
export default ExpenseAggregate;
