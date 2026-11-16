import type { Meta, StoryObj } from "@storybook/react-vite";

import { TextInput } from "./TextInput";

const meta = {
  title: "Components/TextInput",
  component: TextInput,
  args: {
    label: "属性名",
    defaultValue: "家賃",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 652 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2005-137",
    },
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    defaultValue: undefined,
    placeholder: "例: 家賃",
  },
};

export const WithDescription: Story = {
  args: {
    description: "一覧や集計に表示される名前です",
  },
};

export const WithError: Story = {
  args: {
    defaultValue: "",
    errorMessage: "属性名を入力してください",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
