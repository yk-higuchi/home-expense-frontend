import type { Metadata } from "next";
import type { ReactElement } from "react";

import { getIncomeAttributes } from "@/service/income-attribute-service";
import IncomeAttribute from "@/ui/income-attribute";

export const metadata: Metadata = {
  title: "収入属性一覧",
};

interface Props {
  searchParams: Promise<{
    saved?: string;
  }>;
}

const IncomeAttributePage = async (props: Props): Promise<ReactElement> => {
  const { saved } = await props.searchParams;
  const { incomeAttributes, version } = await getIncomeAttributes();
  return (
    <IncomeAttribute
      incomeAttributes={incomeAttributes}
      version={version}
      savedId={saved}
    />
  );
};
export default IncomeAttributePage;
