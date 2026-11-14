import type { ReactElement } from "react";

import { getIncomeAttributeSummary } from "@/service/income-attribute-service";
import { getIncome } from "@/service/income-service";
import IncomeEdit from "@/ui/income-edit";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const IncomeEditPage = async (props: Props): Promise<ReactElement> => {
  const params = await props.params;
  const { id } = params;
  const income = await getIncome({ id, tag: `income-${id}` });
  const { incomeAttributes } = await getIncomeAttributeSummary({
    page: 1,
    perPage: 100,
    tag: `income-attribute`,
  });
  return <IncomeEdit income={income} incomeAttributes={incomeAttributes} />;
};
export default IncomeEditPage;
