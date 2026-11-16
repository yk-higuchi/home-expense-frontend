import type { Meta, StoryObj } from "@storybook/react-vite";

import { SubmitButton } from "./SubmitButton";

const meta = {
  title: "Components/SubmitButton",
  component: SubmitButton,
  args: {
    children: "登録",
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2032-1538",
    },
  },
  render: (args) => (
    <form
      action={async () => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }}
    >
      <SubmitButton {...args} />
    </form>
  ),
} satisfies Meta<typeof SubmitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Danger: Story = {
  args: { children: "削除", variant: "danger" },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
};
