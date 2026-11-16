import type { Metadata } from "next";
import type { ReactElement } from "react";
import { load } from "@/lib/load";
import {
  getBalanceStatistics,
  getMonthlyBalanceSeries,
} from "@/service/balance-service";
import AnnualReport from "@/ui/annual-report";
import { withHeading } from "@/ui/parts/page-heading";

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
  const loaded = await load(() =>
    Promise.all([
      getBalanceStatistics({ year, tag: `balance-statistics-${year}` }),
      getMonthlyBalanceSeries({
        from: new Date(year, 0, 1),
        to: new Date(year, 11, 31),
        tag: `balance-series-${year}`,
      }),
    ]),
  );
  return (
    <AnnualReport
      year={year}
      report={
        loaded.ok
          ? { statistics: loaded.value[0], series: loaded.value[1] }
          : null
      }
    />
  );
};
export default withHeading("年間レポート", AnnualReportPage);
