import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "../icons/icons";
import { Calendar, type CalendarProps } from "./Calendar";
import styles from "./Calendar.stories.module.css";
import theme from "./CalendarTheme.module.css";

const Controlled = (props: CalendarProps) => {
  const [value, setValue] = useState(props.value ?? "");
  return (
    <div>
      <Calendar {...props} value={value} onChange={setValue} />
      <output style={{ display: "block", marginTop: 8 }}>
        選んだ日: {value || "なし"}
      </output>
    </div>
  );
};

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  args: {
    value: "2026-11-20",
    className: theme.calendar,
    previousIcon: <ChevronLeftIcon size={20} />,
    nextIcon: <ChevronRightIcon size={20} />,
  },
  render: (args) => <Controlled {...args} />,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2408-4625",
    },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Plain: Story = {
  args: {
    className: undefined,
    clearable: true,
    previousIcon: undefined,
    nextIcon: undefined,
  },
};

export const CustomTheme: Story = {
  args: { className: styles.dark, clearable: true },
};

export const WithRange: Story = {
  args: { min: "2026-11-10", max: "2027-02-15" },
};

export const WeekStartsOnMonday: Story = {
  args: { weekStartsOn: 1 },
};

export const Limits: Story = {
  args: { value: "0001-01-01" },
};
