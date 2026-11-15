import type { Metadata } from "next";
import type { ReactElement } from "react";

import {
  getBalanceStatistics,
  getMonthlyBalanceSeries,
} from "@/service/balance-service";
import AnnualReport from "@/ui/annual-report";

export const metadata: Metadata = {
  title: "年間レポート",
};

interface Props {
  searchParams: Promise<{
    year?: string;
  }>;
}

const AnnualReportPage = async (props: Props): Promise<ReactElement> => {
  const searchParams = await props.searchParams;
  const year = Number(searchParams.year) || new Date(Date.now()).getFullYear();
  const [statistics, series] = await Promise.all([
    getBalanceStatistics({ year, tag: `balance-statistics-${year}` }),
    getMonthlyBalanceSeries({
      from: new Date(year, 0, 1),
      to: new Date(year, 11, 31),
      tag: `balance-series-${year}`,
    }),
  ]);
  return <AnnualReport year={year} statistics={statistics} series={series} />;
};
export default AnnualReportPage;
