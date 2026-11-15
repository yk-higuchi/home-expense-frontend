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
  returnTo?: string;
}

const ExpenseEdit = ({
  expense,
  expenseAttributes,
  returnTo,
}: Props): ReactElement => {
  const router = useRouter();
  const handleCategoryChange = (category: string) => {
    const searchParams = new URLSearchParams({
      category,
      ...(returnTo && { from: returnTo }),
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
      returnTo={returnTo}
    />
  );
};

export default ExpenseEdit;
