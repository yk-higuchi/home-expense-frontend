import "server-only";
import type { Expense, Expenses } from "@/core/expense";
import type { Pagination } from "@/core/pagination";
import { expensesApi } from "@/network/api/v1-expenses";
import { toPagination } from "@/server/queries/pagination";

export const getExpenseSummary = async ({
  page,
  perPage,
  year,
  month,
  category,
  attributeId,
  tag,
}: {
  page: number;
  perPage: number;
  year?: number;
  month?: number;
  category?: string;
  attributeId?: string;
  tag: string;
}): Promise<{
  expenses: Expenses;
  pagination: Pagination;
}> => {
  const { pagination, response } = await expensesApi.getSummary({
    page,
    perPage,
    year,
    month,
    category,
    attributeId,
    extension: {
      next: { tags: [tag] },
    },
  });
  const { expenses } = response;
  const _expenses: Expenses = expenses.map((value) => {
    const {
      id,
      description,
      expense_attribute: expenseAttribute,
      amount,
      payment_date: paymentDate,
    } = value;
    const { id: attributeId, name, category } = expenseAttribute;
    const expense: Expense = {
      id,
      description,
      amount,
      paymentDate,
      attributeId,
      attributeName: name,
      category: category,
    };
    return expense;
  });
  return {
    expenses: _expenses,
    pagination: toPagination(pagination),
  };
};

export const getExpense = async ({
  id,
  tag,
}: {
  id: string;
  tag: string;
}): Promise<Expense> => {
  const response = await expensesApi.get({
    id,
    extension: {
      next: { tags: [tag] },
    },
  });
  const {
    description,
    expense_attribute: expenseAttribute,
    amount,
    payment_date: paymentDate,
  } = response;
  const { id: attributeId, name, category } = expenseAttribute;
  return {
    id,
    version: response.etag,
    description,
    amount,
    paymentDate,
    attributeId,
    attributeName: name,
    category: category,
  };
};
