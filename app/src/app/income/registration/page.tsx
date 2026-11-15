import type { Metadata } from "next";
import { connection } from "next/server";
import type { ReactElement } from "react";

import { getIncomeAttributes } from "@/service/income-attribute-service";
import IncomeRegistration from "@/ui/income-registration";

export const metadata: Metadata = {
  title: "収入登録",
};

const IncomeRegistrationPage = async (): Promise<ReactElement> => {
  await connection();
  const { incomeAttributes } = await getIncomeAttributes();
  return <IncomeRegistration incomeAttributes={incomeAttributes} />;
};
export default IncomeRegistrationPage;
