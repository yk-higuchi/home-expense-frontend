import type { Metadata } from "next";
import type { ReactElement } from "react";

import { getIncomeAttributeSummary } from "@/service/income-attribute-service";
import IncomeAttribute from "@/ui/income-attribute";

export const metadata: Metadata = {
  title: "収入属性一覧",
};

interface Props {
  searchParams: Promise<{
    page?: string;
    per_page?: string;
  }>;
}

const IncomeAttributePage = async (props: Props): Promise<ReactElement> => {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const perPage = Number(searchParams.per_page) || 20;
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
