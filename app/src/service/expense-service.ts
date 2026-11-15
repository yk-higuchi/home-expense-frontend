"use server";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { expensesApi } from "@/lib/api/v1-expenses";
import type { Expense, Expenses } from "@/lib/expense";
import {
  CONFLICT_MESSAGE,
  collectErrors,
  DELETE_CONFLICT_MESSAGE,
  DELETE_FAILED_MESSAGE,
  type FormState,
  failureMessage,
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
import { HttpError } from "@/lib/http/error";
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
      version,
      description,
      expense_attribute: expenseAttribute,
      amount,
      payment_date: paymentDate,
    } = value;
    const { id: attributeId, name, category } = expenseAttribute;
    const expense: Expense = {
      id,
      version: `"${version}"`,
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
    pagination,
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

export const registerExpense = async (
  _state: FormState,
  formData: FormData,
): Promise<FormState> => {
  const values = formValues(formData, [
    "description",
    "amount",
    "paymentDate",
    "category",
    "attributeId",
  ]);
  const errors = collectErrors({
    description: first(
      required(values.description, "説明"),
      maxLength(values.description, 100, "説明"),
    ),
    amount: amount(values.amount, "金額"),
    paymentDate: date(values.paymentDate, "支払日"),
    attributeId: selected(values.attributeId, "属性名"),
  });
  if (errors) return { errors, values };
  try {
    await expensesApi.post({
      description: values.description,
      attribute_id: values.attributeId,
      amount: parseAmount(values.amount),
      payment_date: values.paymentDate,
    });
  } catch (error) {
    console.error(error);
    return {
      values,
      message: failureMessage(error, SUBMIT_FAILED_MESSAGE),
    };
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
    "version",
    "description",
    "amount",
    "paymentDate",
    "category",
    "attributeId",
  ]);
  const errors = collectErrors({
    description: first(
      required(values.description, "説明"),
      maxLength(values.description, 100, "説明"),
    ),
    amount: amount(values.amount, "金額"),
    paymentDate: date(values.paymentDate, "支払日"),
    attributeId: selected(values.attributeId, "属性名"),
  });
  if (errors) return { errors, values };
  if (!values.version) return { values, message: CONFLICT_MESSAGE };
  try {
    await expensesApi.put({
      ifMatch: values.version,
      id: values.expenseId,
      description: values.description,
      attribute_id: values.attributeId,
      amount: parseAmount(values.amount),
      payment_date: values.paymentDate,
    });
  } catch (error) {
    console.error(error);
    return {
      values,
      message: failureMessage(error, SUBMIT_FAILED_MESSAGE),
    };
  }
  const now = new Date(Date.now());
  const searchParams = new URLSearchParams({
    year: now.getFullYear().toString(),
    month: (now.getMonth() + 1).toString(),
  }).toString();
  redirect(`/expense?${searchParams}`);
};

export const deleteExpense = async (formData: FormData): Promise<FormState> => {
  const id = formData.get("expenseId");
  if (!isString(id) || id === "") return { message: DELETE_FAILED_MESSAGE };
  const version = formData.get("version");
  if (!isString(version) || version === "")
    return { message: DELETE_CONFLICT_MESSAGE };
  try {
    await expensesApi.delete({ id, ifMatch: version });
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      updateTag("expense");
      return {};
    }
    console.error(error);
    return {
      message: failureMessage(
        error,
        DELETE_FAILED_MESSAGE,
        DELETE_CONFLICT_MESSAGE,
      ),
    };
  }
  updateTag("expense");
  return {};
};
