import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button/Button";
import { LoadError } from "./LoadError";

const meta = {
  title: "Components/LoadError",
  component: LoadError,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2175-3277",
    },
  },
  args: { action: <Button>もう一度試す</Button> },
} satisfies Meta<typeof LoadError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NotFound: Story = {
  args: {
    message: "この支出は見つかりませんでした。削除された可能性があります。",
    action: <Button>支出の一覧に戻る</Button>,
  },
};
