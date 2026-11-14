import type { Metadata } from "next";
import type { ReactElement } from "react";

import ExpenseAttributeRegistration from "@/ui/expense-attribute-registration";

export const metadata: Metadata = {
  title: "経費属性登録",
};

const ExpenseAttributeRegistrationPage = (): ReactElement => {
  return <ExpenseAttributeRegistration />;
};
export default ExpenseAttributeRegistrationPage;
