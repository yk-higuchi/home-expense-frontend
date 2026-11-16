import type { ReactElement } from "react";

import { registerIncomeAttribute } from "@/service/income-attribute-service";
import IncomeAttributeForm from "@/ui/parts/income-attribute-form";

const IncomeRegistration = (): ReactElement => {
  return (
    <IncomeAttributeForm action={registerIncomeAttribute} buttonTitle="登録" />
  );
};

export default IncomeRegistration;
