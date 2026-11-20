import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";

import { Select, type SelectProps } from "./Select";

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

export const Default: Story = {};

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

const YEARS = Array.from({ length: 16 }, (_, i) => String(2015 + i));

export const ManyOptions: Story = {
  args: {
    label: "年",
    defaultValue: "2026",
    children: (
      <>
        {YEARS.map((year) => (
          <option key={year} value={year}>
            {year}年
          </option>
        ))}
      </>
    ),
  },
};

export const WithDisabledOption: Story = {
  args: {
    label: "属性名",
    defaultValue: "家賃",
    children: (
      <>
        <option value="家賃">家賃</option>
        <option value="電気" disabled>
          電気（使えません）
        </option>
        <option value="食費">食費</option>
      </>
    ),
  },
};

const ControlledSelect = (props: SelectProps) => {
  const [value, setValue] = useState("固定費");
  return (
    <div>
      <Select
        {...props}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <output style={{ display: "block", marginTop: 8 }}>値: {value}</output>
    </div>
  );
};

export const Controlled: Story = {
  args: { defaultValue: undefined },
  render: (args) => <ControlledSelect {...args} />,
};

export const InForm: Story = {
  args: { name: "category" },
  render: (args) => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const output = event.currentTarget.querySelector("output");
        if (output) output.textContent = `送った値: ${data.get("category")}`;
      }}
    >
      <Select {...args} />
      <button type="submit">送る</button>
      <button type="reset">元に戻す</button>
      <output style={{ display: "block", marginTop: 8 }} />
    </form>
  ),
};
