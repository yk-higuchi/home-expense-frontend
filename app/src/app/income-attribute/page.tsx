import type { Metadata } from "next";
import type { ReactElement } from "react";

import { getIncomeAttributes } from "@/service/income-attribute-service";
import IncomeAttribute from "@/ui/income-attribute";

export const metadata: Metadata = {
  title: "収入属性一覧",
};

const IncomeAttributePage = async (): Promise<ReactElement> => {
  const { incomeAttributes, version } = await getIncomeAttributes();
  return (
    <IncomeAttribute incomeAttributes={incomeAttributes} version={version} />
  );
};
export default IncomeAttributePage;
