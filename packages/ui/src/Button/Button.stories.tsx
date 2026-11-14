import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button, type ButtonVariant } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  args: {
    children: "登録",
    variant: "primary",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "danger", "subtle"],
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2032-1538",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary", children: "キャンセル" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "削除" },
};

export const Subtle: Story = {
  args: { variant: "subtle", children: "詳細" },
};

const all: { variant: ButtonVariant; label: string }[] = [
  { variant: "primary", label: "登録" },
  { variant: "secondary", label: "キャンセル" },
  { variant: "danger", label: "削除" },
  { variant: "subtle", label: "詳細" },
];

/** 全種類を、通常・無効・処理中で並べる（通常はマウスや Tab キーで状態が変わる） */
export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, auto)",
        gap: 16,
        alignItems: "center",
      }}
    >
      {all.map(({ variant, label }) => (
        <div key={variant} style={{ display: "contents" }}>
          <Button variant={variant}>{label}</Button>
          <Button variant={variant} disabled>
            {label}
          </Button>
          <Button variant={variant} loading>
            {label}
          </Button>
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { loading: true },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [
    (Story) => (
      <div style={{ width: 652 }}>
        <Story />
      </div>
    ),
  ],
};
