import type { Metadata } from "next";
import type { ReactElement } from "react";

import { getIncomeSummary } from "@/service/income-service";
import Income from "@/ui/income";

export const metadata: Metadata = {
  title: "収入一覧",
};

interface Props {
  searchParams: Promise<{
    page: number;
    perPage: number;
    year: number;
  }>;
}

const IncomePage = async (props: Props): Promise<ReactElement> => {
  const searchParams = await props.searchParams;
  const now = new Date(Date.now());
  const { page = 1, perPage = 20, year = now.getFullYear() } = searchParams;
  console.log(page, perPage);
  const { incomes, pagination } = await getIncomeSummary({
    page,
    perPage,
    year,
    tag: `income-${year}`,
  });
  console.log(pagination);
  return <Income incomes={incomes} pagination={pagination} year={year} />;
};
export default IncomePage;
