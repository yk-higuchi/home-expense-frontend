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
import style from "./annual-report.module.css";

interface Props {
  year: number;
  /** 1 年分の収支 */
  statistics: BalanceStatistics;
  /** 月ごとの推移（1〜12 月） */
  series: BalancePoint[];
}

const FIRST_YEAR = 2000;

/** 年間レポート（Figma: 年間レポート） */
const AnnualReport = ({ year, statistics, series }: Props): ReactElement => {
  const { isPending, navigate } = useNavigation();
  const thisYear = new Date(Date.now()).getFullYear();
  const years = Array.from(
    { length: Math.max(thisYear, year) - FIRST_YEAR + 1 },
    (_, i) => Math.max(thisYear, year) - i,
  );
  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
    navigate(
      `/annual-report?${new URLSearchParams({ year: event.currentTarget.value })}`,
    );
  };
  return (
    <div className={style.page} aria-busy={isPending || undefined}>
      <Select
        aria-label="年"
        className={style.year}
        value={year}
        onChange={handleYearChange}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}年
          </option>
        ))}
      </Select>
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
            label="収入 − 支出"
            amount={<Amount value={statistics.net} />}
          />
        </SummaryList>
        <BalanceChart title="月別の推移" points={series} />
        <Card title="月別の収支">
          <Table variant="plain">
            <TableHead>
              <TableRow>
                <TableHeaderCell width={120}>月</TableHeaderCell>
                <TableHeaderCell>収入</TableHeaderCell>
                <TableHeaderCell>支出</TableHeaderCell>
                <TableHeaderCell>収入 − 支出</TableHeaderCell>
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
