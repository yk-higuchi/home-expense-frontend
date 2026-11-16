import type { Metadata } from "next";
import type { ReactElement } from "react";
import { getBalanceStatistics } from "@/server/queries/balance";
import { load } from "@/server/queries/load";
import ExpenseAggregate from "@/ui/expense-aggregate";
import { withHeading } from "@/ui/parts/page-heading";

export const metadata: Metadata = {
  title: "HOME",
};

interface Props {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

const HomePage = async (props: Props): Promise<ReactElement> => {
  const searchParams = await props.searchParams;
  const now = new Date(Date.now());
  const year = Number(searchParams.year) || now.getFullYear();
  const month = Number(searchParams.month) || now.getMonth() + 1;
  const loaded = await load(() =>
    getBalanceStatistics({
      year,
      month,
      tag: `balance-statistics-${year}-${month}`,
    }),
  );
  return (
    <ExpenseAggregate
      year={year}
      month={month}
      statistics={loaded.ok ? loaded.value : null}
    />
  );
};
export default withHeading("HOME", HomePage);
