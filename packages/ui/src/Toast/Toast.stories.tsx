import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import { Button } from "../Button/Button";
import { Toast } from "./Toast";
import { useToast } from "./useToast";

const ToastDemo = (): ReactElement => {
  const toast = useToast({
    id: 0,
    text: "「ルミネ」を保存しました",
    tone: "success",
  });
  return (
    <>
      <Button onClick={() => toast.success("「ルミネ」を削除しました")}>
        知らせを出す
      </Button>
      <Button onClick={() => toast.error("削除できませんでした。")}>
        エラーを出す
      </Button>
      <Toast notice={toast.notice} />
    </>
  );
};

const meta = {
  title: "Components/Toast",
  component: ToastDemo,
} satisfies Meta<typeof ToastDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const ErrorDemo = (): ReactElement => (
  <Toast
    notice={{
      id: 1,
      text: "並べ替えを保存できませんでした。時間をおいてもう一度お試しください。",
      tone: "error",
    }}
  />
);

export const ErrorTone: Story = { render: () => <ErrorDemo /> };
