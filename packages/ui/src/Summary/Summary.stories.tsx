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

/** 合計行（金額なしは「内訳」などの見出し） */
export const SummaryRows: Story = {
  render: () => (
    <>
      <SummaryList>
        <SummaryRow label="収入合計" amount="￥250,000" />
        <SummaryRow label="支出合計" amount="￥44,000" />
        <SummaryRow label="収支合計" amount="￥206,000" />
      </SummaryList>
      <div style={{ marginTop: 16 }}>
        <SummaryRow label="内訳" />
      </div>
    </>
  ),
};

/** 内訳（見出しをクリック・Enter キーで開閉できる） */
export const BreakdownTree: Story = {
  render: () => (
    <Breakdown>
      <BreakdownGroup label="固定費" amount="￥23,000">
        <BreakdownItem name="家賃" amount="￥6,000" />
        <BreakdownItem name="サブスクリプション" amount="￥4,000" />
        <BreakdownItem name="月パス課金" amount="￥3,000" />
        <BreakdownItem name="保険" amount="￥4,000" />
        <BreakdownItem name="通信費" amount="￥6,000" />
      </BreakdownGroup>
      <BreakdownGroup label="変動費" amount="￥21,000">
        <BreakdownItem name="電気" amount="￥4,000" />
        <BreakdownItem name="水道" amount="￥4,000" />
        <BreakdownItem name="ガス" amount="￥4,000" />
      </BreakdownGroup>
    </Breakdown>
  ),
};

/** 内訳を閉じた状態 */
export const BreakdownClosed: Story = {
  render: () => (
    <Breakdown>
      <BreakdownGroup label="固定費" amount="￥23,000" defaultOpen={false}>
        <BreakdownItem name="家賃" amount="￥6,000" />
      </BreakdownGroup>
      <BreakdownGroup label="変動費" amount="￥21,000" defaultOpen={false}>
        <BreakdownItem name="電気" amount="￥4,000" />
      </BreakdownGroup>
    </Breakdown>
  ),
};
