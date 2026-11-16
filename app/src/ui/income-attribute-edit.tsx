import type { ReactElement } from "react";

import type { IncomeAttribute } from "@/core/income-attribute";
import { updateIncomeAttribute } from "@/server/actions/income-attribute";
import IncomeAttributeForm from "@/ui/parts/income-attribute-form";

interface Props {
  incomeAttribute: IncomeAttribute;
}

const IncomeAttributeEdit = ({ incomeAttribute }: Props): ReactElement => {
  return (
    <IncomeAttributeForm
      incomeAttribute={incomeAttribute}
      action={updateIncomeAttribute}
      buttonTitle="更新"
    />
  );
};

export default IncomeAttributeEdit;
