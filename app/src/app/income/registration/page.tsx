import type { Metadata } from "next";
import { connection } from "next/server";
import type { ReactElement } from "react";

import { getIncomeAttributeSummary } from "@/service/income-attribute-service";
import IncomeRegistration from "@/ui/income-registration";

export const metadata: Metadata = {
  title: "収入登録",
};

const IncomeRegistrationPage = async (): Promise<ReactElement> => {
  await connection();
  const { incomeAttributes } = await getIncomeAttributeSummary({
    page: 1,
    perPage: 100,
    tag: `income-attribute`,
  });
  return <IncomeRegistration incomeAttributes={incomeAttributes} />;
};
export default IncomeRegistrationPage;
