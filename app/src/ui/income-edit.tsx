"use client";
import type { ReactElement } from "react";

import type { Income } from "@/lib/income";
import type { IncomeAttributes } from "@/lib/income-attribute";
import { updateIncome } from "@/service/income-service";
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
    />
  );
};

export default IncomeEdit;
