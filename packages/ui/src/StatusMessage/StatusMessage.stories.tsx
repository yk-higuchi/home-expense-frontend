import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusMessage } from "./StatusMessage";

const meta = {
  title: "Components/StatusMessage",
  component: StatusMessage,
  args: { children: "「ルミネ」を保存しました" },
} satisfies Meta<typeof StatusMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Saved: Story = {};

export const Deleted: Story = {
  args: { children: "「ルミネ」を削除しました" },
};
