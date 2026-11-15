"use client";
import { Button, PlusIcon, Select } from "@home-expense/ui";
import { useRouter } from "next/navigation";
import type React from "react";
import type { ChangeEvent, ReactElement } from "react";
import type { ExpenseAttributes } from "@/lib/expense-attribute";
import { useNavigation } from "@/lib/hooks/use-navigation";
import type { Pagination } from "@/lib/pagination/pagination";
import ExpenseAttributeTable from "@/ui/parts/expense-attribute-table";
import layout from "@/ui/parts/list-layout.module.css";
import PaginationComponent from "@/ui/parts/pagination-component";

interface Props {
  category: string;
  expenseAttributes: ExpenseAttributes;
  pagination: Pagination;
}

const ExpenseAttribute = ({
  category,
  expenseAttributes,
  pagination,
}: Props): ReactElement => {
  const router = useRouter();
  const { isPending, navigate } = useNavigation();
  const handleMovePrevious = (page: number, perPage: number) => {
    const searchParams = new URLSearchParams({
      category,
      page: page.toString(),
      per_page: perPage.toString(),
    });
    navigate(`/expense-attribute?${searchParams.toString()}`);
  };

  const handleMoveNext = (page: number, perPage: number) => {
    const searchParams = new URLSearchParams({
      category,
      page: page.toString(),
      per_page: perPage.toString(),
    });
    navigate(`/expense-attribute?${searchParams.toString()}`);
  };

  const handleMovePage = (page: number, perPage: number) => {
    const searchParams = new URLSearchParams({
      category,
      page: page.toString(),
      per_page: perPage.toString(),
    });
    navigate(`/expense-attribute?${searchParams.toString()}`);
  };

  const handleRegistrationClick = (): void => {
    router.push("/expense-attribute/registration");
  };

  const handleEdit = (id: string) => {
    router.push(`/expense-attribute/${id}`);
  };

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const searchParams = new URLSearchParams({
      category: event.currentTarget.value,
    }).toString();
    navigate(`/expense-attribute?${searchParams}`);
  };
  return (
    <div className={layout.page}>
      {/* 絞り込みと追加ボタンは表の上に並べる */}
      <div className={layout.toolbar}>
        <div className={layout.filters}>
          <Select
            label="分類"
            className={layout.categoryFilter}
            name="category"
            defaultValue={category}
            onChange={handleCategoryChange}
          >
            <option value="固定費">固定費</option>
            <option value="変動費">変動費</option>
          </Select>
        </div>
        <div className={layout.actions}>
          <Button icon={<PlusIcon />} onClick={handleRegistrationClick}>
            追加
          </Button>
        </div>
      </div>
      <ExpenseAttributeTable
        loading={isPending}
        expenseAttributes={expenseAttributes}
        pagination={pagination}
        onEdit={handleEdit}
        footer={
          <PaginationComponent
            pagination={pagination}
            onMovePrevious={handleMovePrevious}
            onMoveNext={handleMoveNext}
            onMovePage={handleMovePage}
          />
        }
      />
    </div>
  );
};
export default ExpenseAttribute;
