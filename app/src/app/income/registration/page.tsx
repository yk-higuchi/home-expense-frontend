import type { Metadata } from "next";
import { connection } from "next/server";
import type { ReactElement } from "react";
import { load } from "@/lib/load";
import { getIncomeAttributes } from "@/service/income-attribute-service";
import IncomeRegistration from "@/ui/income-registration";
import { FormLoadFailed } from "@/ui/parts/load-failed";

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
export default IncomeRegistrationPage;
