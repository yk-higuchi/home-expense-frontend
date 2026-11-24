import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button/Button";
import { Select } from "../Select/Select";
import { TextInput } from "../TextInput/TextInput";
import { Skeleton } from "./Skeleton";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2174-2358",
    },
  },
  args: { width: 120 },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Controls: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, width: 320 }}>
      <TextInput label="説明" skeleton />
      <Select label="分類" skeleton />
      <Button skeleton>登録</Button>
    </div>
  ),
};
