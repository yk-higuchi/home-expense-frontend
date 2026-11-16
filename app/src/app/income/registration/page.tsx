import type { Metadata } from "next";
import { connection } from "next/server";
import type { ReactElement } from "react";
import { getIncomeAttributes } from "@/server/queries/income-attribute";
import { load } from "@/server/queries/load";
import IncomeRegistration from "@/ui/income-registration";
import { FormLoadFailed } from "@/ui/parts/load-failed";
import { withHeading } from "@/ui/parts/page-heading";

export const metadata: Metadata = {
  title: "収入登録",
};

const IncomeRegistrationPage = async (): Promise<ReactElement> => {
  await connection();
  const loaded = await load(() => getIncomeAttributes());
  if (!loaded.ok) return <FormLoadFailed />;
  return (
    <IncomeRegistration incomeAttributes={loaded.value.incomeAttributes} />
  );
};
export default withHeading("収入登録", IncomeRegistrationPage);
