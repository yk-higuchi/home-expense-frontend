import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useState } from "react";

import { Button } from "../Button/Button";
import { Toast, type ToastNotice } from "./Toast";

const ToastDemo = (): ReactElement => {
  const [notice, setNotice] = useState<ToastNotice | null>({
    id: 1,
    text: "「ルミネ」を保存しました",
  });
  return (
    <>
      <Button
        onClick={() =>
          setNotice({ id: Date.now(), text: "「ルミネ」を削除しました" })
        }
      >
        知らせを出す
      </Button>
      <Toast notice={notice} />
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
