import type { Metadata } from "next";
import { connection } from "next/server";
import type { ReactElement } from "react";
import { toDateString } from "@/core/balance";
import { getIncomeAttributes } from "@/server/queries/income-attribute";
import { load } from "@/server/queries/load";
import IncomeRegistration from "@/ui/income-registration";
import { FormLoadFailed } from "@/ui/parts/load-failed";
import { withHeading } from "@/ui/parts/page-heading";

export const metadata: Metadata = {
  title: "収入登録",
};

interface Props {
  searchParams: Promise<{
    from?: string;
  }>;
}

const IncomeRegistrationPage = async (props: Props): Promise<ReactElement> => {
  await connection();
  const { from } = await props.searchParams;
  const loaded = await load(() => getIncomeAttributes());
  if (!loaded.ok) return <FormLoadFailed />;
  return (
    <IncomeRegistration
      incomeAttributes={loaded.value.incomeAttributes}
      today={toDateString(new Date(Date.now()))}
      returnTo={from}
    />
  );
};
export default withHeading("収入登録", IncomeRegistrationPage);
