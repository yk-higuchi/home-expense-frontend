import type { Metadata } from "next";
import type { ReactElement } from "react";

import IncomeAttributeRegistration from "@/ui/income-attribute-registration";

export const metadata: Metadata = {
  title: "収入属性登録",
};

const IncomeAttributeRegistrationPage = (): ReactElement => {
  return <IncomeAttributeRegistration />;
};
export default IncomeAttributeRegistrationPage;
