"use client";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type ReactElement,
  useCallback,
  useState,
} from "react";
import type { ExpenseAttributeAggregates } from "@/lib/expense-attribute";
import style from "./expense-aggregate.module.css";

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
  const router = useRouter();
  const formattedYear = year.toString().padStart(2, "0");
  const formattedMonth = month.toString().padStart(2, "0");
  const [yearMonth, setYearMonth] = useState(
    `${formattedYear}-${formattedMonth}`,
  );
  const handleYearMonthChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const date = new Date(event.currentTarget.value);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString();
      const searchParams = new URLSearchParams({
        year: year,
        month: month,
      }).toString();
      setYearMonth(`${year.padStart(2, "0")}-${month.padStart(2, "0")}`);
      router.push(`/home?${searchParams}`);
    },
    [router],
  );
  const formattedIncomeTotalAmount = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(incomeTotalAmount);
  const formattedDisposalIncomeAmount = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(disposalIncomeAmount);
  const formattedTotalAmount = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(totalAmount);
  const formattedFixedTotalAmount = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(fixed.totalAmount);
  const formattedVariableTotalAmount = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(variable.totalAmount);
  const fixedExpenses = fixed.attributeAggregates.map((value) => {
    const { name, totalAmount } = value;
    const formattedAmount = new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(totalAmount);
    return (
      <div key={name}>
        {name} {formattedAmount}
      </div>
    );
  });
  const variableExpenses = variable.attributeAggregates.map((value) => {
    const { name, totalAmount } = value;
    const formattedAmount = new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(totalAmount);
    return (
      <div key={name}>
        {name} {formattedAmount}
      </div>
    );
  });
  return (
    <div className={style.textStyle}>
      <input
        className={style.yearMonth}
        type="month"
        aria-label="年月"
        value={yearMonth}
        onChange={handleYearMonthChange}
      />
      <div className={style.labelStyale}>
        <span>収入合計</span>
        <div>{formattedIncomeTotalAmount}</div>
      </div>
      <div className={style.labelStyale}>
        <span>支出合計</span>
        <div>{formattedTotalAmount}</div>
      </div>
      <div className={style.labelStyale}>
        <span>収入 - 支出</span>
        <div>{formattedDisposalIncomeAmount}</div>
      </div>
      <div>
        <span className={style.labelStyale}>内訳</span>
        <div className={style.amountStyle}>
          <details>
            <summary>固定費 {formattedFixedTotalAmount}</summary>
            <div className={style.expensesStyle}>{fixedExpenses}</div>
          </details>
          <details>
            <summary>変動費 {formattedVariableTotalAmount}</summary>
            <div className={style.expensesStyle}>{variableExpenses}</div>
          </details>
        </div>
      </div>
    </div>
  );
};
export default ExpenseAggregate;
