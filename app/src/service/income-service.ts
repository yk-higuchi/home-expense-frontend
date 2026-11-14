"use server";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { incomesApi } from "@/lib/api/v1-incomes";
import {
  collectErrors,
  DELETE_FAILED_MESSAGE,
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
import type { Income, Incomes } from "@/lib/income";
import type { Pagination } from "@/lib/pagination/pagination";
import { isString } from "@/lib/type-guard";

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
  // await new Promise((resolve) => setTimeout(resolve, 5000));
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
  // await new Promise((resolve) => setTimeout(resolve, 5000));
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
    description,
    amount,
    receiveDate,
    attributeId,
    attributeName: name,
  };
};

export const registerIncome = async (
  _state: FormState,
  formData: FormData,
): Promise<FormState> => {
  const values = formValues(formData, [
    "description",
    "amount",
    "receiveDate",
    "attributeId",
  ]);
  const errors = collectErrors({
    description: first(
      required(values.description, "説明"),
      maxLength(values.description, 100, "説明"),
    ),
    amount: amount(values.amount, "金額"),
    receiveDate: date(values.receiveDate, "受取日"),
    attributeId: selected(values.attributeId, "属性名"),
  });
  if (errors) return { errors, values };
  try {
    await incomesApi.post({
      description: values.description,
      attribute_id: values.attributeId,
      amount: parseAmount(values.amount),
      receive_date: values.receiveDate,
    });
  } catch (error) {
    console.error(error);
    return { values, message: SUBMIT_FAILED_MESSAGE };
  }
  redirect("/income");
};

export const updateIncome = async (
  _state: FormState,
  formData: FormData,
): Promise<FormState> => {
  const values = formValues(formData, [
    "incomeId",
    "description",
    "amount",
    "receiveDate",
    "attributeId",
  ]);
  const errors = collectErrors({
    description: first(
      required(values.description, "説明"),
      maxLength(values.description, 100, "説明"),
    ),
    amount: amount(values.amount, "金額"),
    receiveDate: date(values.receiveDate, "受取日"),
    attributeId: selected(values.attributeId, "属性名"),
  });
  if (errors) return { errors, values };
  try {
    await incomesApi.put({
      id: values.incomeId,
      description: values.description,
      attribute_id: values.attributeId,
      amount: parseAmount(values.amount),
      receive_date: values.receiveDate,
    });
  } catch (error) {
    console.error(error);
    return { values, message: SUBMIT_FAILED_MESSAGE };
  }
  redirect("/income");
};

export const deleteIncome = async (formData: FormData): Promise<FormState> => {
  const id = formData.get("incomeId");
  if (!isString(id) || id === "") return { message: DELETE_FAILED_MESSAGE };
  try {
    await incomesApi.delete({ id });
  } catch (error) {
    console.error(error);
    return { message: DELETE_FAILED_MESSAGE };
  }
  updateTag("income");
  return {};
};
