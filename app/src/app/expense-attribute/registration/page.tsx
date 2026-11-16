import type { Metadata } from "next";
import type { ReactElement } from "react";
import ExpenseAttributeRegistration from "@/ui/expense-attribute-registration";
import { withHeading } from "@/ui/parts/page-heading";

export const metadata: Metadata = {
  title: "支出属性登録",
};

const ExpenseAttributeRegistrationPage = (): ReactElement => {
  return <ExpenseAttributeRegistration />;
};
export default withHeading("支出属性登録", ExpenseAttributeRegistrationPage);
