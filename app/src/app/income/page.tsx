import type { Metadata } from "next";
import type { ReactElement } from "react";

import { load } from "@/lib/load";
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
    saved?: string;
  }>;
}

const IncomePage = async (props: Props): Promise<ReactElement> => {
  const searchParams = await props.searchParams;
  const now = new Date(Date.now());
  const page = Number(searchParams.page) || 1;
  const perPage = Number(searchParams.per_page) || 20;
  const year = Number(searchParams.year) || now.getFullYear();
  const loaded = await load(() =>
    getIncomeSummary({
      page,
      perPage,
      year,
      tag: `income-${year}`,
    }),
  );
  return (
    <Income
      list={loaded.ok ? loaded.value : null}
      year={year}
      savedId={searchParams.saved}
    />
  );
};
export default IncomePage;
