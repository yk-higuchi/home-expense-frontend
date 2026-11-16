import type { Meta, StoryObj } from "@storybook/react-vite";

import { NavBar } from "./NavBar";

const meta = {
  title: "Components/NavBar",
  component: NavBar,
  args: {
    title: "家計簿",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 811 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2005-133",
    },
  },
  globals: {
    backgrounds: { value: "background" },
  },
} satisfies Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
