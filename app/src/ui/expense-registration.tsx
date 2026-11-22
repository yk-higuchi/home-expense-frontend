"use client";

import { useRouter } from "next/navigation";
import type { ReactElement } from "react";

import type { ExpenseAttributes } from "@/core/expense-attribute";
import { registerExpense } from "@/server/actions/expense";
import ExpenseForm from "@/ui/parts/expense-form";
import { listHref } from "@/ui/parts/form-actions";

interface Props {
  expenseAttributes: ExpenseAttributes;
  today: string;
  returnTo?: string;
}

const ExpenseRegistration = ({
  expenseAttributes,
  today,
  returnTo,
}: Props): ReactElement => {
  const router = useRouter();
  const handleCategoryChange = (category: string) => {
    const searchParams = new URLSearchParams({
      category,
      ...(returnTo && { from: returnTo }),
    }).toString();
    router.push(`/expense/registration?${searchParams}`);
  };
  return (
    <ExpenseForm
      expenseAttributes={expenseAttributes}
      onCategoryChange={handleCategoryChange}
      action={registerExpense}
      buttonTitle="登録"
      defaultDate={today}
      returnTo={returnTo}
      backHref={listHref("/expense", returnTo)}
    />
  );
};

export default ExpenseRegistration;
