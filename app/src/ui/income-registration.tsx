import type { ReactElement } from "react";

import type { IncomeAttributes } from "@/core/income-attribute";
import { registerIncome } from "@/server/actions/income";
import { listHref } from "@/ui/parts/form-actions";
import IncomeForm from "@/ui/parts/income-form";

interface Props {
  incomeAttributes: IncomeAttributes;
  today: string;
  returnTo?: string;
}

const IncomeRegistration = ({
  incomeAttributes,
  today,
  returnTo,
}: Props): ReactElement => {
  return (
    <IncomeForm
      incomeAttributes={incomeAttributes}
      action={registerIncome}
      buttonTitle="登録"
      defaultDate={today}
      returnTo={returnTo}
      backHref={listHref("/income", returnTo)}
    />
  );
};

export default IncomeRegistration;
