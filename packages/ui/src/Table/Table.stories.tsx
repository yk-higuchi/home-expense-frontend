import type { Meta, StoryObj } from "@storybook/react-vite";

import { Pagination } from "../Pagination/Pagination";

import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "./Table";
import { TableActions } from "./TableActions";

const attributes = [
  { id: "1", name: "家賃", category: "固定費" },
  { id: "2", name: "サブスクリプション", category: "固定費" },
  { id: "3", name: "電気", category: "変動費" },
  { id: "4", name: "食費", category: "変動費" },
];

const EXPENSE_HEADERS = ["支払日", "説明", "属性名", "分類", "金額"] as const;

const expenses = [
  ["2024/10/05", "スーパー", "食費", "変動費", "3,000円"],
  ["2024/10/10", "電気代", "電気", "変動費", "4,000円"],
  ["2024/10/25", "家賃", "家賃", "固定費", "60,000円"],
];

const noop = (): void => {};

const meta = {
  title: "Components/Table",
  component: Table,
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
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2006-122",
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const AttributeHead = () => (
  <TableHead>
    <TableRow>
      <TableHeaderCell width={102}>No.</TableHeaderCell>
      <TableHeaderCell>属性名</TableHeaderCell>
      <TableHeaderCell width={200}>分類</TableHeaderCell>
      <TableHeaderCell width={104}>編集</TableHeaderCell>
    </TableRow>
  </TableHead>
);

export const ExpenseAttributes: Story = {
  render: (args) => (
    <Table {...args}>
      <AttributeHead />
      <TableBody>
        {attributes.map(({ id, name, category }, i) => (
          <TableRow key={id}>
            <TableCell>{i + 1}</TableCell>
            <TableCell>{name}</TableCell>
            <TableCell>{category}</TableCell>
            <TableCell>
              <TableActions
                onEdit={noop}
                onDelete={noop}
                editLabel={`${name}を編集`}
                deleteLabel={`${name}を削除`}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const Expenses: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <TableHeaderCell width={128}>支払日</TableHeaderCell>
          <TableHeaderCell>説明</TableHeaderCell>
          <TableHeaderCell>属性名</TableHeaderCell>
          <TableHeaderCell width={96}>分類</TableHeaderCell>
          <TableHeaderCell width={128} align="end">
            金額
          </TableHeaderCell>
          <TableHeaderCell width={104}>編集</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {expenses.map((row) => (
          <TableRow key={row.join()}>
            {row.map((value, column) => (
              <TableCell
                key={EXPENSE_HEADERS[column]}
                align={EXPENSE_HEADERS[column] === "金額" ? "end" : "start"}
              >
                {value}
              </TableCell>
            ))}
            <TableCell>
              <TableActions onEdit={noop} onDelete={noop} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const Empty: Story = {
  render: (args) => (
    <Table {...args}>
      <AttributeHead />
      <TableBody>
        <TableEmpty colSpan={4} />
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  args: {
    footer: <Pagination currentPage={1} totalPages={10} onPageChange={noop} />,
  },
  render: ExpenseAttributes.render,
};

export const Loading: Story = {
  args: { loading: true },
  render: ExpenseAttributes.render,
};

export const Plain: Story = {
  args: { variant: "plain" },
  render: ExpenseAttributes.render,
};
