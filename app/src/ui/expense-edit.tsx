"use client";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";

import type { Expense } from "@/lib/expense";
import type { ExpenseAttributes } from "@/lib/expense-attribute";
import { updateExpense } from "@/service/expense-service";
import ExpenseForm from "@/ui/parts/expense-form";

interface Props {
  expense: Expense;
  expenseAttributes: ExpenseAttributes;
}

const ExpenseEdit = ({ expense, expenseAttributes }: Props): ReactElement => {
  const router = useRouter();
  const handleCategoryChange = (category: string) => {
    const searchParams = new URLSearchParams({
      category,
    }).toString();
    router.push(`/expense/${expense.id}?${searchParams}`);
  };
  return (
    <ExpenseForm
      expense={expense}
      expenseAttributes={expenseAttributes}
      onCategoryChange={handleCategoryChange}
      action={updateExpense}
      buttonTitle="更新"
    />
  );
};

export default ExpenseEdit;
