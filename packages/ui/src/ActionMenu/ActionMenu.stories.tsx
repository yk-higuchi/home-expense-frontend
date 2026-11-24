import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionMenu } from "./ActionMenu";

const noop = (): void => {};

const meta = {
  title: "Components/ActionMenu",
  component: ActionMenu,
  args: {
    label: "家賃の操作",
    items: [
      { label: "上へ移動", onSelect: noop },
      { label: "下へ移動", onSelect: noop },
      { label: "編集", onSelect: noop },
      { label: "削除", onSelect: noop, tone: "danger" },
    ],
  },
} satisfies Meta<typeof ActionMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FirstRow: Story = {
  args: {
    items: [
      { label: "上へ移動", onSelect: noop, disabled: true },
      { label: "下へ移動", onSelect: noop },
      { label: "編集", onSelect: noop },
      { label: "削除", onSelect: noop, tone: "danger" },
    ],
  },
};
