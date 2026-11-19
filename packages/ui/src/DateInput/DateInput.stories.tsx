import type { Meta, StoryObj } from "@storybook/react-vite";

import { DateInput } from "./DateInput";

const meta = {
  title: "Components/DateInput",
  component: DateInput,
  args: {
    label: "支払日",
    name: "paymentDate",
    defaultValue: "2026-11-20",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 652 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DateInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { defaultValue: undefined },
};

export const WithRange: Story = {
  args: {
    description: "2026年11月10日から30日まで選べます。",
    min: "2026-11-10",
    max: "2026-11-30",
  },
};

export const WithError: Story = {
  args: { defaultValue: undefined, errorMessage: "支払日を入力してください。" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithStep: Story = {
  args: {
    description: "月曜日だけ選べます（7 日おき）。",
    min: "2026-11-02",
    step: 7,
    defaultValue: "2026-11-16",
  },
};

export const Required: Story = {
  args: { required: true },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
};
