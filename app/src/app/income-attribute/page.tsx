import type { Metadata } from "next";
import type { ReactElement } from "react";
import { load } from "@/lib/load";
import { getIncomeAttributes } from "@/service/income-attribute-service";
import IncomeAttribute from "@/ui/income-attribute";
import { withHeading } from "@/ui/parts/page-heading";

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
  const loaded = await load(() => getIncomeAttributes());
  return (
    <IncomeAttribute list={loaded.ok ? loaded.value : null} savedId={saved} />
  );
};
export default withHeading("収入属性一覧", IncomeAttributePage);
