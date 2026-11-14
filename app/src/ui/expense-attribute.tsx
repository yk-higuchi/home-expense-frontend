"use client";
import { Button, PlusIcon, Select } from "@home-expense/ui";
import { useRouter } from "next/navigation";
import type React from "react";
import { type ChangeEvent, type ReactElement, useCallback } from "react";
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
  const handleMovePrevious = useCallback(
    (page: number, perPage: number) => {
      const searchParams = new URLSearchParams({
        category,
        page: page.toString(),
        per_page: perPage.toString(),
      });
      navigate(`/expense-attribute?${searchParams.toString()}`);
    },
    [category, navigate],
  );

  const handleMoveNext = useCallback(
    (page: number, perPage: number) => {
      const searchParams = new URLSearchParams({
        category,
        page: page.toString(),
        per_page: perPage.toString(),
      });
      navigate(`/expense-attribute?${searchParams.toString()}`);
    },
    [category, navigate],
  );

  const handleMovePage = useCallback(
    (page: number, perPage: number) => {
      const searchParams = new URLSearchParams({
        category,
        page: page.toString(),
        per_page: perPage.toString(),
      });
      navigate(`/expense-attribute?${searchParams.toString()}`);
    },
    [category, navigate],
  );

  const handleRegistrationClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      console.log(event);
      router.push("/expense-attribute/registration");
    },
    [router],
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/expense-attribute/${id}`);
    },
    [router],
  );

  const handleCategoryChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const searchParams = new URLSearchParams({
        category: event.currentTarget.value,
      }).toString();
      navigate(`/expense-attribute?${searchParams}`);
    },
    [navigate],
  );
  return (
    <div className={layout.page}>
      <div className={layout.filters}>
        <Select
          label="分類"
          className={layout.medium}
          name="category"
          defaultValue={category}
          onChange={handleCategoryChange}
        >
          <option value="固定費">固定費</option>
          <option value="変動費">変動費</option>
        </Select>
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
      <div className={layout.actions}>
        <Button icon={<PlusIcon />} onClick={handleRegistrationClick}>
          追加
        </Button>
      </div>
    </div>
  );
};
export default ExpenseAttribute;
