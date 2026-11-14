import type { Metadata } from "next";
import type { ReactElement } from "react";

import { getExpenseAggregate } from "@/service/expense-service";
import ExpenseAggregate from "@/ui/expense-aggregate";

export const metadata: Metadata = {
  title: "HOME",
};

interface Props {
  searchParams: Promise<{
    year: number;
    month: number;
  }>;
}

const HomePage = async (props: Props): Promise<ReactElement> => {
  const searchParams = await props.searchParams;
  const now = new Date(Date.now());
  const { year = now.getFullYear(), month = now.getMonth() + 1 } = searchParams;
  console.log(year, month);
  const aggregate = await getExpenseAggregate({
    year,
    month,
    tag: `expense-aggregate-${year}-${month}`,
  });
  const {
    incomeTotalAmount,
    disposalIncomeAmount,
    totalAmount,
    fixed,
    variable,
  } = aggregate;
  return (
    <ExpenseAggregate
      year={year}
      month={month}
      incomeTotalAmount={incomeTotalAmount}
      disposalIncomeAmount={disposalIncomeAmount}
      totalAmount={totalAmount}
      fixed={fixed}
      variable={variable}
    />
  );
};
export default HomePage;
