import type { Meta, StoryObj } from "@storybook/react-vite";

import { Chart } from "./Chart";

const months = [...Array(12)].map((_, i) => `${i + 1}月`);
const income = [250, 250, 250, 250, 250, 450, 250, 250, 250, 250, 250, 450].map(
  (v) => v * 1000,
);
const expense = [
  180, 190, 175, 210, 185, 230, 200, 270, 190, 185, 195, 240,
].map((v) => v * 1000);
const net = income.map((v, i) => v - (expense[i] ?? 0));

const meta = {
  title: "Components/Chart",
  component: Chart,
  args: {
    title: "月別の推移",
    labels: months,
    series: [
      {
        label: "収入",
        values: income,
        type: "bar",
        color: "var(--color-chart-1)",
      },
      {
        label: "支出",
        values: expense,
        type: "bar",
        color: "var(--color-chart-2)",
      },
      {
        label: "収支",
        values: net,
        type: "line",
        color: "var(--color-chart-3)",
      },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 715 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2038-1582",
    },
  },
} satisfies Meta<typeof Chart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MonthlyBalance: Story = {};

export const WithMissing: Story = {
  args: {
    series: [
      {
        label: "収入",
        values: income.map((v, i) => (i === 3 ? null : v)),
        type: "bar",
        color: "var(--color-chart-1)",
      },
      {
        label: "収支",
        values: net.map((v, i) => (i === 3 || i === 4 ? null : v)),
        type: "line",
        color: "var(--color-chart-3)",
      },
    ],
  },
};

export const Daily: Story = {
  args: {
    title: "日ごとの収支",
    labels: [...Array(366)].map((_, i) => `${i + 1}日`),
    series: [
      {
        label: "収支",
        values: [...Array(366)].map((_, i) =>
          Math.round(Math.sin(i / 20) * 30000 + (i % 7) * 2000),
        ),
        type: "line",
        color: "var(--color-chart-3)",
      },
    ],
  },
};

export const Empty: Story = {
  args: { labels: [], series: [] },
};
