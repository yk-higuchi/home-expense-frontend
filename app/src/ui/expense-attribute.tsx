"use client";
import { Button, PlusIcon, Select } from "@home-expense/ui";
import { useRouter } from "next/navigation";
import type { ChangeEvent, ReactElement } from "react";
import type { ExpenseAttributes } from "@/lib/expense-attribute";
import { useNavigation } from "@/lib/hooks/use-navigation";
import ExpenseAttributeTable from "@/ui/parts/expense-attribute-table";
import layout from "@/ui/parts/list-layout.module.css";

interface Props {
  category: string;
  expenseAttributes: ExpenseAttributes;
  version: string;
}

const ExpenseAttribute = ({
  category,
  expenseAttributes,
  version,
}: Props): ReactElement => {
  const router = useRouter();
  const { isPending, navigate } = useNavigation();

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
        version={version}
        onEdit={handleEdit}
        category={category}
      />
    </div>
  );
};
export default ExpenseAttribute;
