import type { Metadata } from "next";
import type { ReactElement } from "react";
import IncomeAttributeRegistration from "@/ui/income-attribute-registration";
import { withHeading } from "@/ui/parts/page-heading";

export const metadata: Metadata = {
  title: "収入属性登録",
};

const IncomeAttributeRegistrationPage = (): ReactElement => {
  return <IncomeAttributeRegistration />;
};
export default withHeading("収入属性登録", IncomeAttributeRegistrationPage);
