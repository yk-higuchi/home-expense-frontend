import type { ReactElement } from "react";

import type { Income } from "@/core/income";
import type { IncomeAttributes } from "@/core/income-attribute";
import { updateIncome } from "@/server/actions/income";
import { listHref } from "@/ui/parts/form-actions";
import IncomeForm from "@/ui/parts/income-form";

interface Props {
  income: Income;
  incomeAttributes: IncomeAttributes;
  returnTo?: string;
}

const IncomeEdit = ({
  income,
  incomeAttributes,
  returnTo,
}: Props): ReactElement => {
  return (
    <IncomeForm
      income={income}
      incomeAttributes={incomeAttributes}
      action={updateIncome}
      buttonTitle="更新"
      returnTo={returnTo}
      backHref={listHref("/income", returnTo)}
    />
  );
};

export default IncomeEdit;
