import { Card, Chart } from "@home-expense/ui";
import type { ReactElement } from "react";
import { type BalancePoint, monthLabel } from "@/core/balance";

interface Props {
  title: string;
  points: BalancePoint[];
  showTable?: boolean;
}

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
