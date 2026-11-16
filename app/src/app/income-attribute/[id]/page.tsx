import type { Metadata } from "next";
import type { ReactElement } from "react";
import { getIncomeAttribute } from "@/server/queries/income-attribute";
import { load } from "@/server/queries/load";
import IncomeAttributeEdit from "@/ui/income-attribute-edit";
import { FormLoadFailed } from "@/ui/parts/load-failed";
import { withHeading } from "@/ui/parts/page-heading";

export const metadata: Metadata = {
  title: "収入属性編集",
};

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const IncomeAttributeEditPage = async (props: Props): Promise<ReactElement> => {
  const params = await props.params;
  const { id } = params;
  const loaded = await load(
    () => getIncomeAttribute({ id, tag: `income-attribute-${id}` }),
    { notFoundOn404: true },
  );
  if (!loaded.ok) return <FormLoadFailed />;
  return <IncomeAttributeEdit incomeAttribute={loaded.value} />;
};
export default withHeading("収入属性編集", IncomeAttributeEditPage);
