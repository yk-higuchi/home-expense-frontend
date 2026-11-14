"use server";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { expensesApi } from "@/lib/api/v1-expenses";
import { expensesAggregateApi } from "@/lib/api/v1-expenses-aggregate";
import type { Expense, Expenses } from "@/lib/expense";
import type {
  ExpenseAttributeAggregate,
  ExpenseAttributeAggregates,
} from "@/lib/expense-attribute";
import {
  collectErrors,
  type FormState,
  formValues,
  SUBMIT_FAILED_MESSAGE,
} from "@/lib/form/form-state";
import {
  amount,
  date,
  first,
  maxLength,
  parseAmount,
  required,
  selected,
} from "@/lib/form/validation";
import type { Pagination } from "@/lib/pagination/pagination";
import { isString } from "@/lib/type-guard";

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
  // await new Promise((resolve) => setTimeout(resolve, 5000));
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
      price,
      payment_date: paymentDate,
    } = value;
    const { id: attributeId, name, category } = expenseAttribute;
    const expense: Expense = {
      id,
      description,
      price,
      paymentDate,
      attributeId,
      attributeName: name,
      category: category,
    };
    return expense;
  });
  return {
    expenses: _expenses,
    pagination,
  };
};

export const getExpenseAggregate = async ({
  year,
  month,
  tag,
}: {
  year: number;
  month: number;
  tag: string;
}): Promise<{
  incomeTotalAmount: number;
  disposalIncomeAmount: number;
  totalAmount: number;
  fixed: {
    totalAmount: number;
    attributeAggregates: ExpenseAttributeAggregates;
  };
  variable: {
    totalAmount: number;
    attributeAggregates: ExpenseAttributeAggregates;
  };
}> => {
  const response = await expensesAggregateApi.get({
    year,
    month,
    extension: {
      next: { tags: [tag] },
    },
  });
  const {
    income_total_amount,
    disposal_income_amount,
    total_amount,
    variable_expense_detail,
    fixed_expense_detail,
  } = response;
  const fixedAggregates: ExpenseAttributeAggregates =
    fixed_expense_detail.attribute_aggregates.map((value) => {
      const { attribute_id, attribute_name, total_amount } = value;
      const aggregate: ExpenseAttributeAggregate = {
        id: attribute_id,
        name: attribute_name,
        totalAmount: total_amount,
      };
      return aggregate;
    });
  const variableAggregates: ExpenseAttributeAggregates =
    variable_expense_detail.attribute_aggregates.map((value) => {
      const { attribute_id, attribute_name, total_amount } = value;
      const aggregate: ExpenseAttributeAggregate = {
        id: attribute_id,
        name: attribute_name,
        totalAmount: total_amount,
      };
      return aggregate;
    });
  return {
    incomeTotalAmount: income_total_amount,
    disposalIncomeAmount: disposal_income_amount,
    totalAmount: total_amount,
    fixed: {
      totalAmount: fixed_expense_detail.total_amount,
      attributeAggregates: fixedAggregates,
    },
    variable: {
      totalAmount: variable_expense_detail.total_amount,
      attributeAggregates: variableAggregates,
    },
  };
};

export const getExpense = async ({
  id,
  tag,
}: {
  id: string;
  tag: string;
}): Promise<Expense> => {
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  const response = await expensesApi.get({
    id,
    extension: {
      next: { tags: [tag] },
    },
  });
  const {
    description,
    expense_attribute: expenseAttribute,
    price,
    payment_date: paymentDate,
  } = response;
  const { id: attributeId, name, category } = expenseAttribute;
  return {
    id,
    description,
    price,
    paymentDate,
    attributeId,
    attributeName: name,
    category: category,
  };
};

export const registerExpense = async (
  _state: FormState,
  formData: FormData,
): Promise<FormState> => {
  const values = formValues(formData, [
    "description",
    "price",
    "paymentDate",
    "category",
    "attributeId",
  ]);
  const errors = collectErrors({
    description: first(
      required(values.description, "説明"),
      maxLength(values.description, 100, "説明"),
    ),
    price: amount(values.price, "金額"),
    paymentDate: date(values.paymentDate, "支払日"),
    attributeId: selected(values.attributeId, "属性名"),
  });
  if (errors) return { errors, values };
  try {
    await expensesApi.post({
      description: values.description,
      attribute_id: values.attributeId,
      price: parseAmount(values.price),
      payment_date: values.paymentDate,
    });
  } catch (error) {
    console.error(error);
    return { values, message: SUBMIT_FAILED_MESSAGE };
  }
  const now = new Date(Date.now());
  const searchParams = new URLSearchParams({
    year: now.getFullYear().toString(),
    month: (now.getMonth() + 1).toString(),
  }).toString();
  redirect(`/expense?${searchParams}`);
};

export const updateExpense = async (
  _state: FormState,
  formData: FormData,
): Promise<FormState> => {
  const values = formValues(formData, [
    "expenseId",
    "description",
    "price",
    "paymentDate",
    "category",
    "attributeId",
  ]);
  const errors = collectErrors({
    description: first(
      required(values.description, "説明"),
      maxLength(values.description, 100, "説明"),
    ),
    price: amount(values.price, "金額"),
    paymentDate: date(values.paymentDate, "支払日"),
    attributeId: selected(values.attributeId, "属性名"),
  });
  if (errors) return { errors, values };
  try {
    await expensesApi.put({
      id: values.expenseId,
      description: values.description,
      attribute_id: values.attributeId,
      price: parseAmount(values.price),
      payment_date: values.paymentDate,
    });
  } catch (error) {
    console.error(error);
    return { values, message: SUBMIT_FAILED_MESSAGE };
  }
  const now = new Date(Date.now());
  const searchParams = new URLSearchParams({
    year: now.getFullYear().toString(),
    month: (now.getMonth() + 1).toString(),
  }).toString();
  redirect(`/expense?${searchParams}`);
};

export const deleteExpense = async (formData: FormData): Promise<void> => {
  const expenseId = formData.get("expenseId");
  if (isString(expenseId)) {
    await expensesApi.delete({ id: expenseId });
    updateTag("expense");
  }
};
