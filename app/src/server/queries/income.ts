import "server-only";
import type { Income, Incomes } from "@/core/income";
import { incomesApi } from "@/network/api/v1-incomes";
import type { Pagination } from "@/network/pagination/pagination";

export const getIncomeSummary = async ({
  page,
  perPage,
  year,
  tag,
}: {
  page: number;
  perPage: number;
  year: number;
  tag: string;
}): Promise<{
  incomes: Incomes;
  pagination: Pagination;
}> => {
  const { pagination, response } = await incomesApi.getSummary({
    page,
    perPage,
    year,
    extension: {
      next: { tags: [tag] },
    },
  });
  const { incomes } = response;
  const _incomes: Incomes = incomes.map((value) => {
    const {
      id,
      description,
      income_attribute: incomeAttribute,
      amount,
      receive_date: receiveDate,
    } = value;
    const { id: attributeId, name } = incomeAttribute;
    const income: Income = {
      id,
      description,
      amount,
      receiveDate,
      attributeId,
      attributeName: name,
    };
    return income;
  });
  return {
    incomes: _incomes,
    pagination,
  };
};

export const getIncome = async ({
  id,
  tag,
}: {
  id: string;
  tag: string;
}): Promise<Income> => {
  const response = await incomesApi.get({
    id,
    extension: {
      next: { tags: [tag] },
    },
  });
  const {
    description,
    income_attribute: incomeAttribute,
    amount,
    receive_date: receiveDate,
  } = response;
  const { id: attributeId, name } = incomeAttribute;
  return {
    id,
    version: response.etag,
    description,
    amount,
    receiveDate,
    attributeId,
    attributeName: name,
  };
};
