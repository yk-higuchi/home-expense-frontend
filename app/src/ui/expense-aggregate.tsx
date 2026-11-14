"use client";
import {
  Breakdown,
  BreakdownGroup,
  BreakdownItem,
  SummaryList,
  SummaryRow,
  TextInput,
} from "@home-expense/ui";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type ReactElement, useState } from "react";
import type { ExpenseAttributeAggregates } from "@/lib/expense-attribute";
import { useNavigation } from "@/lib/hooks/use-navigation";
import style from "./expense-aggregate.module.css";

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
});

interface Props {
  year: number;
  month: number;
  incomeTotalAmount: number;
  disposalIncomeAmount: number;
  totalAmount: number;
  fixed: {
    totalAmount: number;
    attributeAggregates: ExpenseAttributeAggregates;
  };
  variable: {
    totalAmount: number;
    attributeAggregates: ExpenseAttributeAggregates;
  };
}

const ExpenseAggregate = ({
  year,
  month,
  incomeTotalAmount,
  disposalIncomeAmount,
  totalAmount,
  fixed,
  variable,
}: Props): ReactElement => {
  const _router = useRouter();
  const { isPending, navigate } = useNavigation();
  const formattedYear = year.toString().padStart(2, "0");
  const formattedMonth = month.toString().padStart(2, "0");
  const [yearMonth, setYearMonth] = useState(
    `${formattedYear}-${formattedMonth}`,
  );
  const handleYearMonthChange = (event: ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.currentTarget.value);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString();
    const searchParams = new URLSearchParams({
      year: year,
      month: month,
    }).toString();
    setYearMonth(`${year.padStart(2, "0")}-${month.padStart(2, "0")}`);
    navigate(`/home?${searchParams}`);
  };
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
          <SummaryRow label="収入合計" amount={yen.format(incomeTotalAmount)} />
          <SummaryRow label="支出合計" amount={yen.format(totalAmount)} />
          <SummaryRow
            label="収入 − 支出"
            amount={yen.format(disposalIncomeAmount)}
          />
        </SummaryList>
        <SummaryRow label="内訳" />
        <Breakdown className={style.breakdown}>
          <BreakdownGroup label="固定費" amount={yen.format(fixed.totalAmount)}>
            {fixed.attributeAggregates.map(({ name, totalAmount }) => (
              <BreakdownItem
                key={name}
                name={name}
                amount={yen.format(totalAmount)}
              />
            ))}
          </BreakdownGroup>
          <BreakdownGroup
            label="変動費"
            amount={yen.format(variable.totalAmount)}
          >
            {variable.attributeAggregates.map(({ name, totalAmount }) => (
              <BreakdownItem
                key={name}
                name={name}
                amount={yen.format(totalAmount)}
              />
            ))}
          </BreakdownGroup>
        </Breakdown>
      </div>
    </div>
  );
};
export default ExpenseAggregate;
