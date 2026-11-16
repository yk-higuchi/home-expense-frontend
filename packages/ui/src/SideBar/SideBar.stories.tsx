import type { Meta, StoryObj } from "@storybook/react-vite";

import { SideBar } from "./SideBar";

const items = [
  { label: "HOME", href: "#home" },
  { label: "収入属性", href: "#income-attribute" },
  { label: "支出属性", href: "#expense-attribute" },
  { label: "収入", href: "#income" },
  { label: "支出", href: "#expense" },
  { label: "年間レポート", href: "#annual-report" },
];

const meta = {
  title: "Components/SideBar",
  component: SideBar,
  args: {
    items: items.map((item, i) => ({ ...item, active: i === 0 })),
  },
  decorators: [
    (Story) => (
      <div style={{ height: 680 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { disable: false },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2005-120",
    },
  },
  globals: {
    backgrounds: { value: "background" },
  },
} satisfies Meta<typeof SideBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ExpenseAttributeActive: Story = {
  args: {
    items: items.map((item) => ({
      ...item,
      active: item.label === "支出属性",
    })),
  },
};
