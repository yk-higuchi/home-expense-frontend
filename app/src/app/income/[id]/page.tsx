import type { Metadata } from "next";
import type { ReactElement } from "react";
import { load } from "@/lib/load";
import { getIncomeAttributes } from "@/service/income-attribute-service";
import { getIncome } from "@/service/income-service";
import IncomeEdit from "@/ui/income-edit";
import { FormLoadFailed } from "@/ui/parts/load-failed";

export const metadata: Metadata = {
  title: "収入編集",
};

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    from?: string;
  }>;
}

const IncomeEditPage = async (props: Props): Promise<ReactElement> => {
  const params = await props.params;
  const { id } = params;
  const loaded = await load(
    async () => {
      const income = await getIncome({ id, tag: `income-${id}` });
      const { incomeAttributes } = await getIncomeAttributes();
      return { income, incomeAttributes };
    },
    { notFoundOn404: true },
  );
  if (!loaded.ok) return <FormLoadFailed />;
  const { income, incomeAttributes } = loaded.value;
  const { from } = await props.searchParams;
  return (
    <IncomeEdit
      income={income}
      incomeAttributes={incomeAttributes}
      returnTo={from}
    />
  );
};
export default IncomeEditPage;
