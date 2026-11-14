"use client";
import { Button, PlusIcon } from "@home-expense/ui";
import { useRouter } from "next/navigation";
import type React from "react";
import { type ReactElement, useCallback } from "react";
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
  const handleMovePrevious = useCallback(
    (page: number, perPage: number) => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });
      navigate(`/income-attribute?${searchParams.toString()}`);
    },
    [navigate],
  );

  const handleMoveNext = useCallback(
    (page: number, perPage: number) => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });
      navigate(`/income-attribute?${searchParams.toString()}`);
    },
    [navigate],
  );

  const handleMovePage = useCallback(
    (page: number, perPage: number) => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });
      navigate(`/income-attribute?${searchParams.toString()}`);
    },
    [navigate],
  );

  const handleRegistrationClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      console.log(event);
      router.push("/income-attribute/registration");
    },
    [router],
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/income-attribute/${id}`);
    },
    [router],
  );
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
