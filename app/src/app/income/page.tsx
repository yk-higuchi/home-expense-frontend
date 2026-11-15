import type { Metadata } from "next";
import type { ReactElement } from "react";

import { getIncomeSummary } from "@/service/income-service";
import Income from "@/ui/income";

export const metadata: Metadata = {
  title: "収入一覧",
};

interface Props {
  searchParams: Promise<{
    page?: string;
    per_page?: string;
    year?: string;
  }>;
}

const IncomePage = async (props: Props): Promise<ReactElement> => {
  const searchParams = await props.searchParams;
  const now = new Date(Date.now());
  // 画面の URL は per_page（API と同じ名前）
  const page = Number(searchParams.page) || 1;
  const perPage = Number(searchParams.per_page) || 20;
  const year = Number(searchParams.year) || now.getFullYear();
  const { incomes, pagination } = await getIncomeSummary({
    page,
    perPage,
    year,
    tag: `income-${year}`,
  });
  return <Income incomes={incomes} pagination={pagination} year={year} />;
};
export default IncomePage;
