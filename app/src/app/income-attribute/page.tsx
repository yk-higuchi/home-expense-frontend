import type { Metadata } from "next";
import type { ReactElement } from "react";

import { getIncomeAttributeSummary } from "@/service/income-attribute-service";
import IncomeAttribute from "@/ui/income-attribute";

export const metadata: Metadata = {
  title: "収入属性一覧",
};

interface Props {
  searchParams: Promise<{
    page: number;
    perPage: number;
  }>;
}

const IncomeAttributePage = async (props: Props): Promise<ReactElement> => {
  const searchParams = await props.searchParams;
  const { page = 1, perPage = 20 } = searchParams;
  console.log(page, perPage);
  const { incomeAttributes, pagination } = await getIncomeAttributeSummary({
    page,
    perPage,
    tag: "income-attribute",
  });
  return (
    <IncomeAttribute
      incomeAttributes={incomeAttributes}
      pagination={pagination}
    />
  );
};
export default IncomeAttributePage;
