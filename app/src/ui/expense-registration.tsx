"use client";

import { useRouter } from "next/navigation";
import type { ReactElement } from "react";

import type { ExpenseAttributes } from "@/core/expense-attribute";
import { registerExpense } from "@/server/actions/expense";
import ExpenseForm from "@/ui/parts/expense-form";

interface Props {
  expenseAttributes: ExpenseAttributes;
}

const ExpenseRegistration = ({ expenseAttributes }: Props): ReactElement => {
  const router = useRouter();
  const handleCategoryChange = (category: string) => {
    const searchParams = new URLSearchParams({
      category,
    }).toString();
    router.push(`/expense/registration?${searchParams}`);
  };
  return (
    <ExpenseForm
      expenseAttributes={expenseAttributes}
      onCategoryChange={handleCategoryChange}
      action={registerExpense}
      buttonTitle="登録"
    />
  );
};

export default ExpenseRegistration;
