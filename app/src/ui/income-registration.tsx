import type { ReactElement } from "react";

import type { IncomeAttributes } from "@/core/income-attribute";
import { registerIncome } from "@/server/actions/income";
import IncomeForm from "@/ui/parts/income-form";

interface Props {
  incomeAttributes: IncomeAttributes;
}

const IncomeRegistration = ({ incomeAttributes }: Props): ReactElement => {
  return (
    <IncomeForm
      incomeAttributes={incomeAttributes}
      action={registerIncome}
      buttonTitle="登録"
    />
  );
};

export default IncomeRegistration;
