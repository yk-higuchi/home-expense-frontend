import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Breakdown,
  BreakdownGroup,
  BreakdownItem,
  SummaryList,
  SummaryRow,
} from "./Summary";

const meta = {
  title: "Components/Summary",
  decorators: [
    (Story) => (
      <div style={{ width: 763 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2006-157",
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SummaryRows: Story = {
  render: () => (
    <>
      <SummaryList>
        <SummaryRow label="収入合計" amount="250,000円" />
        <SummaryRow label="支出合計" amount="44,000円" />
        <SummaryRow label="収支合計" amount="206,000円" />
      </SummaryList>
      <div style={{ marginTop: 16 }}>
        <SummaryRow label="内訳" />
      </div>
    </>
  ),
};

export const BreakdownTree: Story = {
  render: () => (
    <Breakdown>
      <BreakdownGroup label="固定費" amount="23,000円">
        <BreakdownItem name="家賃" amount="6,000円" />
        <BreakdownItem name="サブスクリプション" amount="4,000円" />
        <BreakdownItem name="月パス課金" amount="3,000円" />
        <BreakdownItem name="保険" amount="4,000円" />
        <BreakdownItem name="通信費" amount="6,000円" />
      </BreakdownGroup>
      <BreakdownGroup label="変動費" amount="21,000円">
        <BreakdownItem name="電気" amount="4,000円" />
        <BreakdownItem name="水道" amount="4,000円" />
        <BreakdownItem name="ガス" amount="4,000円" />
      </BreakdownGroup>
    </Breakdown>
  ),
};

export const BreakdownClosed: Story = {
  render: () => (
    <Breakdown>
      <BreakdownGroup label="固定費" amount="23,000円" defaultOpen={false}>
        <BreakdownItem name="家賃" amount="6,000円" />
      </BreakdownGroup>
      <BreakdownGroup label="変動費" amount="21,000円" defaultOpen={false}>
        <BreakdownItem name="電気" amount="4,000円" />
      </BreakdownGroup>
    </Breakdown>
  ),
};
