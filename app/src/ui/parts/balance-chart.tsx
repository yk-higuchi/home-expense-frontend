"use client";

import { Card, Chart } from "@home-expense/ui";
import type { ReactElement } from "react";
import { type BalancePoint, monthLabel } from "@/lib/balance";

interface Props {
  title: string;
  points: BalancePoint[];
  /** 「表で見る」を出すか（同じ値の表が画面にあるときは false） */
  showTable?: boolean;
}

/**
 * 月ごとの収入・支出（棒）と収支（線）のグラフ（Figma: 推移グラフ）
 * 色は項目ごとに固定する（収入=1・支出=2・収支=3）
 */
const BalanceChart = ({ title, points, showTable }: Props): ReactElement => (
  <Card title={title}>
    <Chart
      title={title}
      showTable={showTable}
      labels={points.map((p) => monthLabel(p.from))}
      series={[
        {
          label: "収入",
          type: "bar",
          color: "var(--color-chart-1)",
          values: points.map((p) => p.incomeTotal),
        },
        {
          label: "支出",
          type: "bar",
          color: "var(--color-chart-2)",
          values: points.map((p) => p.expenseTotal),
        },
        {
          label: "収支",
          type: "line",
          color: "var(--color-chart-3)",
          values: points.map((p) => p.net),
        },
      ]}
    />
  </Card>
);
export default BalanceChart;
