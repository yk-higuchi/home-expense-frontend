import type { ReactElement } from "react";

import { getIncomeAttribute } from "@/service/income-attribute-service";
import IncomeAttributeEdit from "@/ui/income-attribute-edit";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const IncomeAttributeEditPage = async (props: Props): Promise<ReactElement> => {
  const params = await props.params;
  const { id } = params;
  const incomeAttribute = await getIncomeAttribute({
    id,
    tag: `income-attribute-${id}`,
  });
  return <IncomeAttributeEdit incomeAttribute={incomeAttribute} />;
};
export default IncomeAttributeEditPage;
