"use client";
import { Button, PlusIcon } from "@home-expense/ui";
import { useRouter } from "next/navigation";
import type React from "react";
import type { ReactElement } from "react";
import { useNavigation } from "@/lib/hooks/use-navigation";

import type { IncomeAttributes } from "@/lib/income-attribute";
import type { Pagination } from "@/lib/pagination/pagination";
import IncomeAttributeTable from "@/ui/parts/income-attribute-table";
import layout from "@/ui/parts/list-layout.module.css";
import PaginationComponent from "@/ui/parts/pagination-component";

interface Props {
  incomeAttributes: IncomeAttributes;
  pagination: Pagination;
}

const IncomeAttribute = ({
  incomeAttributes,
  pagination,
}: Props): ReactElement => {
  const router = useRouter();
  const { isPending, navigate } = useNavigation();
  const handleMovePrevious = (page: number, perPage: number) => {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    navigate(`/income-attribute?${searchParams.toString()}`);
  };

  const handleMoveNext = (page: number, perPage: number) => {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    navigate(`/income-attribute?${searchParams.toString()}`);
  };

  const handleMovePage = (page: number, perPage: number) => {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    navigate(`/income-attribute?${searchParams.toString()}`);
  };

  const handleRegistrationClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    console.log(event);
    router.push("/income-attribute/registration");
  };

  const handleEdit = (id: string) => {
    router.push(`/income-attribute/${id}`);
  };
  return (
    <div className={layout.page}>
      <IncomeAttributeTable
        loading={isPending}
        incomeAttributes={incomeAttributes}
        pagination={pagination}
        onEdit={handleEdit}
        footer={
          <PaginationComponent
            pagination={pagination}
            onMovePrevious={handleMovePrevious}
            onMoveNext={handleMoveNext}
            onMovePage={handleMovePage}
          />
        }
      />
      <div className={layout.actions}>
        <Button icon={<PlusIcon />} onClick={handleRegistrationClick}>
          追加
        </Button>
      </div>
    </div>
  );
};
export default IncomeAttribute;
