"use client";

import {
  Amount,
  Card,
  Select,
  SummaryList,
  SummaryRow,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@home-expense/ui";
import type { ChangeEvent, ReactElement } from "react";
import {
  type BalancePoint,
  type BalanceStatistics,
  monthLabel,
} from "@/lib/balance";
import { useNavigation } from "@/lib/hooks/use-navigation";
import BalanceChart from "@/ui/parts/balance-chart";
import layout from "@/ui/parts/list-layout.module.css";
import { YEARS } from "@/ui/parts/year-month-options";
import style from "./annual-report.module.css";

interface Props {
  year: number;
  statistics: BalanceStatistics;
  series: BalancePoint[];
}

const AnnualReport = ({ year, statistics, series }: Props): ReactElement => {
  const { isPending, navigate } = useNavigation();
  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
    navigate(
      `/annual-report?${new URLSearchParams({ year: event.currentTarget.value })}`,
    );
  };
  return (
    <div className={style.page} aria-busy={isPending || undefined}>
      <div className={layout.filters}>
        <Select
          label="年"
          className={layout.yearFilter}
          name="year"
          value={year}
          onChange={handleYearChange}
        >
          {YEARS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
      </div>
      <div className={isPending ? style.pending : style.content}>
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
      </div>
    </div>
  );
};
export default AnnualReport;
