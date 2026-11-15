import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../Table/Table";
import { DragHandle, ReorderButtons, SortableStatus } from "./Sortable";
import { useSortableList } from "./useSortableList";

interface Attribute {
  id: string;
  name: string;
}

const ATTRIBUTES: Attribute[] = [
  "家賃",
  "月パス課金",
  "サブスクリプション",
  "保険",
  "通信費",
  "習いごと",
  "サブスクリプション(年額)",
  "税金",
].map((name, index) => ({ id: `attribute-${index + 1}`, name }));

const SortableAttributes = ({
  disabled = false,
}: {
  disabled?: boolean;
}): ReactElement => {
  const [attributes, setAttributes] = useState(ATTRIBUTES);
  const { handleProps, rowProps, canMove, moveBy, announcement } =
    useSortableList({
      items: attributes,
      getId: (attribute) => attribute.id,
      getLabel: (attribute) => attribute.name,
      onReorder: (ids) =>
        setAttributes(
          ids.flatMap((id) => attributes.filter((a) => a.id === id)),
        ),
      disabled,
    });
  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell width={64} aria-label="並べ替え" />
            <TableHeaderCell width={88}>No.</TableHeaderCell>
            <TableHeaderCell>属性名</TableHeaderCell>
            <TableHeaderCell width={104}>順番</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attributes.map((attribute, index) => (
            <TableRow key={attribute.id} {...rowProps(attribute)}>
              <TableCell>
                <DragHandle {...handleProps(attribute)} />
              </TableCell>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{attribute.name}</TableCell>
              <TableCell>
                <ReorderButtons
                  label={attribute.name}
                  onMoveUp={() => moveBy(attribute, -1)}
                  onMoveDown={() => moveBy(attribute, 1)}
                  canMoveUp={canMove(attribute, -1)}
                  canMoveDown={canMove(attribute, 1)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <SortableStatus message={announcement} />
    </>
  );
};

const meta = {
  title: "Components/Sortable",
  component: SortableAttributes,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2079-1549",
    },
  },
} satisfies Meta<typeof SortableAttributes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};
