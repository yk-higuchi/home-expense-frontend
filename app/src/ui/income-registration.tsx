import type { ReactElement } from "react";

import type { IncomeAttributes } from "@/core/income-attribute";
import { registerIncome } from "@/server/actions/income";
import IncomeForm from "@/ui/parts/income-form";

interface Props {
  incomeAttributes: IncomeAttributes;
  today: string;
}

const IncomeRegistration = ({
  incomeAttributes,
  today,
}: Props): ReactElement => {
  return (
    <IncomeForm
      incomeAttributes={incomeAttributes}
      action={registerIncome}
      buttonTitle="登録"
      defaultDate={today}
    />
  );
};

export default IncomeRegistration;
