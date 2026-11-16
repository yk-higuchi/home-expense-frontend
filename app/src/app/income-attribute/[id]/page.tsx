import type { Metadata } from "next";
import type { ReactElement } from "react";
import { load } from "@/lib/load";
import { getIncomeAttribute } from "@/service/income-attribute-service";
import IncomeAttributeEdit from "@/ui/income-attribute-edit";
import { FormLoadFailed } from "@/ui/parts/load-failed";

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
export default IncomeAttributeEditPage;
