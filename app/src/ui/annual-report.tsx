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
} from "@/lib/balance";
import AnnualReportFrame from "@/ui/parts/annual-report-frame";
import BalanceChart from "@/ui/parts/balance-chart";

interface Props {
  year: number;
  statistics: BalanceStatistics;
  series: BalancePoint[];
}

const AnnualReport = ({ year, statistics, series }: Props): ReactElement => {
  return (
    <AnnualReportFrame year={year}>
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
    </AnnualReportFrame>
  );
};
export default AnnualReport;
