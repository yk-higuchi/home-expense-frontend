import type { Meta, StoryObj } from "@storybook/react-vite";

import { BarList } from "./BarList";

const series = [
  { id: "fixed", label: "固定費", color: "var(--color-chart-fixed)" },
  { id: "variable", label: "変動費", color: "var(--color-chart-variable)" },
];

const items = [
  { id: "rent", label: "家賃", value: 160000, series: "fixed" },
  { id: "tax", label: "税金", value: 130766, series: "fixed" },
  { id: "food", label: "食費", value: 79351, series: "variable" },
  { id: "insurance", label: "保険", value: 43657, series: "fixed" },
  { id: "lesson", label: "習いごと", value: 43450, series: "fixed" },
  {
    id: "subscription",
    label: "サブスクリプション",
    value: 18913,
    series: "fixed",
  },
  { id: "transport", label: "交通費", value: 796, series: "variable" },
];
const total = items.reduce((sum, { value }) => sum + value, 0);

const meta = {
  title: "Components/BarList",
  component: BarList,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
  args: { items, total, series, label: "支出の多い順" },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2214-4223",
    },
  },
} satisfies Meta<typeof BarList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleSeries: Story = {
  args: { series: [] },
};

export const Empty: Story = {
  args: { items: [], empty: "この月の支出はありません" },
};
