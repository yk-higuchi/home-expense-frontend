import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../Button/Button";
import { Dialog } from "./Dialog";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  args: {
    open: true,
    onClose: () => {},
    title: "経費属性の削除",
    description: "削除したデータは復元できません。削除しますか？",
    actions: (
      <>
        <Button variant="secondary">キャンセル</Button>
        <Button variant="danger">削除</Button>
      </>
    ),
  },
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2023-433",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 削除の確認（開いた状態） */
export const DeleteConfirm: Story = {};

/** ボタンで開閉する。削除を押すと 1.5 秒「処理中」になってから閉じる */
export const Interactive: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    return (
      <div style={{ padding: 24 }}>
        <Button variant="danger" onClick={() => setOpen(true)}>
          削除する
        </Button>
        <Dialog
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          actions={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                キャンセル
              </Button>
              <Button
                variant="danger"
                loading={pending}
                onClick={() => {
                  setPending(true);
                  setTimeout(() => {
                    setPending(false);
                    setOpen(false);
                  }, 1500);
                }}
              >
                削除
              </Button>
            </>
          }
        />
      </div>
    );
  },
  args: { open: false },
};
