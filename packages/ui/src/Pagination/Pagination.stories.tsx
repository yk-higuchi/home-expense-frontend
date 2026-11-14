import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Pagination } from "./Pagination";

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: () => {},
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/k99TXVIrWbQ9YYSNBnbaFW/?node-id=2006-155",
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 最初のページ（前へは押せない） */
export const FirstPage: Story = {};

/** 途中のページ（前後が省略される） */
export const MiddlePage: Story = {
  args: { currentPage: 6, totalPages: 20 },
};

/** 最後のページ（次へは押せない） */
export const LastPage: Story = {
  args: { currentPage: 10 },
};

/** 1 ページだけ */
export const SinglePage: Story = {
  args: { totalPages: 1 },
};

/** クリックでページが切り替わる */
export const Interactive: Story = {
  render: (args) => {
    const [page, setPage] = useState(args.currentPage);
    return <Pagination {...args} currentPage={page} onPageChange={setPage} />;
  },
};
