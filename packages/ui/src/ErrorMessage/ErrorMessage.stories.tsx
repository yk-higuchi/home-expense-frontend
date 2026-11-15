import type { Meta, StoryObj } from "@storybook/react-vite";

import { ErrorMessage } from "./ErrorMessage";

const meta = {
  title: "Components/ErrorMessage",
  component: ErrorMessage,
  args: {
    children: "保存できませんでした。時間をおいてもう一度お試しください。",
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2070-1513",
    },
  },
} satisfies Meta<typeof ErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 保存に失敗したとき */
export const SubmitFailed: Story = {};

/** ほかの操作で更新されていたとき（楽観的ロック） */
export const Conflict: Story = {
  args: {
    children:
      "ほかの操作で内容が更新されています。画面を読み込み直してから、もう一度保存してください。",
  },
};
