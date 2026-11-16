import {
  Amount,
  Card,
  SummaryList,
  SummaryRow,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@home-expense/ui";
import type { ReactElement } from "react";
import {
  type BalancePoint,
  type BalanceStatistics,
  monthLabel,
} from "@/core/balance";
import BalanceChart from "@/ui/parts/balance-chart";
import { LoadFailed } from "@/ui/parts/load-failed";
import PeriodFilterFrame from "@/ui/parts/period-filter-frame";
import style from "./annual-report.module.css";

interface Props {
  year: number;
  report: { statistics: BalanceStatistics; series: BalancePoint[] } | null;
}

const AnnualReport = ({ year, report }: Props): ReactElement => {
  const classes = {
    page: style.page,
    content: style.content,
    pending: style.pending,
  };
  if (report === null) {
    return (
      <PeriodFilterFrame path="/annual-report" year={year} classes={classes}>
        <LoadFailed />
      </PeriodFilterFrame>
    );
  }
  const { statistics, series } = report;
  return (
    <PeriodFilterFrame path="/annual-report" year={year} classes={classes}>
      <SummaryList>
        <SummaryRow
          label="収入合計"
          amount={<Amount value={statistics.income.total} />}
        />
        <SummaryRow
          label="支出合計"
          amount={<Amount value={statistics.expenseTotal} />}
        />
        <SummaryRow
          label="収支合計"
          amount={<Amount value={statistics.net} />}
        />
      </SummaryList>
      <BalanceChart title="月別の推移" points={series} showTable={false} />
      <Card title="月別の収支">
        <Table variant="plain">
          <TableHead>
            <TableRow>
              <TableHeaderCell width={120}>月</TableHeaderCell>
              <TableHeaderCell>収入</TableHeaderCell>
              <TableHeaderCell>支出</TableHeaderCell>
              <TableHeaderCell>収支</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {series.map((point) => (
              <TableRow key={point.from}>
                <TableCell>{monthLabel(point.from)}</TableCell>
                <TableCell>
                  <Amount value={point.incomeTotal} />
                </TableCell>
                <TableCell>
                  <Amount value={point.expenseTotal} />
                </TableCell>
                <TableCell>
                  <Amount value={point.net} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </PeriodFilterFrame>
  );
};
export default AnnualReport;
