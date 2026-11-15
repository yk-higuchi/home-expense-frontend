"use client";
import { Button, PlusIcon } from "@home-expense/ui";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";

import type { IncomeAttributes } from "@/lib/income-attribute";
import IncomeAttributeTable from "@/ui/parts/income-attribute-table";
import layout from "@/ui/parts/list-layout.module.css";

interface Props {
  incomeAttributes: IncomeAttributes;
  version: string;
  savedId?: string;
}

const IncomeAttribute = ({
  incomeAttributes,
  version,
  savedId,
}: Props): ReactElement => {
  const router = useRouter();

  const handleRegistrationClick = (): void => {
    router.push("/income-attribute/registration");
  };

  const handleEdit = (id: string) => {
    router.push(`/income-attribute/${id}`);
  };
  return (
    <div className={layout.page}>
      <div className={layout.actions}>
        <Button icon={<PlusIcon />} onClick={handleRegistrationClick}>
          追加
        </Button>
      </div>
      <IncomeAttributeTable
        savedId={savedId}
        incomeAttributes={incomeAttributes}
        version={version}
        onEdit={handleEdit}
      />
    </div>
  );
};
export default IncomeAttribute;
