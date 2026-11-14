import type { Metadata } from "next";
import type { ReactElement } from "react";

import {
  getBalanceStatistics,
  getMonthlyBalanceSeries,
} from "@/service/balance-service";
import ExpenseAggregate from "@/ui/expense-aggregate";

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
  // 今月の収支と、直近 12 か月の推移を同時に取得する
  const [statistics, series] = await Promise.all([
    getBalanceStatistics({
      year,
      month,
      tag: `balance-statistics-${year}-${month}`,
    }),
    getMonthlyBalanceSeries({
      from: new Date(year, month - 12, 1),
      to: new Date(year, month, 0),
      tag: `balance-series-${year}-${month}-12m`,
    }),
  ]);
  return (
    <ExpenseAggregate
      year={year}
      month={month}
      statistics={statistics}
      series={series}
    />
  );
};
export default HomePage;
