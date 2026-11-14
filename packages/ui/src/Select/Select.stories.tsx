import type { Meta, StoryObj } from "@storybook/react-vite";

import { Select } from "./Select";

const meta = {
  title: "Components/Select",
  component: Select,
  args: {
    label: "分類",
    defaultValue: "固定費",
    children: (
      <>
        <option value="固定費">固定費</option>
        <option value="変動費">変動費</option>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 652 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2005-147",
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** フォーム用（ラベル付き） */
export const Default: Story = {};

/** 期間選択用（ラベルなし） */
export const WithoutLabel: Story = {
  args: {
    label: undefined,
    "aria-label": "年月",
    defaultValue: "2024-10",
    children: (
      <>
        <option value="2024-09">2024年9月</option>
        <option value="2024-10">2024年10月</option>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 160 }}>
        <Story />
      </div>
    ),
  ],
};

export const WithError: Story = {
  args: {
    defaultValue: "",
    errorMessage: "分類を選択してください",
    children: (
      <>
        <option value="">選択してください</option>
        <option value="固定費">固定費</option>
        <option value="変動費">変動費</option>
      </>
    ),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
