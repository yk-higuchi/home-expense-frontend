import type { Metadata } from "next";
import type { ReactElement } from "react";
import { isExpenseAttributeCategory } from "@/core/expense-attribute";
import ExpenseAttributeRegistration from "@/ui/expense-attribute-registration";
import { withHeading } from "@/ui/parts/page-heading";

export const metadata: Metadata = {
  title: "支出属性登録",
};

interface Props {
  searchParams: Promise<{
    category?: string;
  }>;
}

const ExpenseAttributeRegistrationPage = async (
  props: Props,
): Promise<ReactElement> => {
  const { category } = await props.searchParams;
  return (
    <ExpenseAttributeRegistration
      category={isExpenseAttributeCategory(category) ? category : undefined}
    />
  );
};
export default withHeading("支出属性登録", ExpenseAttributeRegistrationPage);
