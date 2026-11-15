"use server";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { incomesApi } from "@/lib/api/v1-incomes";
import {
  DELETE_TARGET_LOAD_FAILED_MESSAGE,
  DELETE_TARGET_MISSING_MESSAGE,
  type DeleteTargetResult,
  formatYen,
} from "@/lib/delete-target";
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
import type { Income, Incomes } from "@/lib/income";
import { incomeListUrl } from "@/lib/list-return";
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
  let id: string;
  try {
    id = await incomesApi.post({
      description: values.description,
      attribute_id: values.attributeId,
      amount: parseAmount(values.amount),
      receive_date: values.receiveDate,
    });
  } catch (error) {
    console.error(error);
    return {
      values,
      message: failureMessage(error, SUBMIT_FAILED_MESSAGE),
    };
  }
  redirect(incomeListUrl({ receiveDate: values.receiveDate, savedId: id }));
};

export const updateIncome = async (
  _state: FormState,
  formData: FormData,
): Promise<FormState> => {
  const values = formValues(formData, [
    "incomeId",
    "version",
    "description",
    "amount",
    "receiveDate",
    "attributeId",
    "returnTo",
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
  if (!values.version) return { values, message: CONFLICT_MESSAGE };
  try {
    await incomesApi.put({
      ifMatch: values.version,
      id: values.incomeId,
      description: values.description,
      attribute_id: values.attributeId,
      amount: parseAmount(values.amount),
      receive_date: values.receiveDate,
    });
  } catch (error) {
    console.error(error);
    return {
      values,
      message: failureMessage(error, SUBMIT_FAILED_MESSAGE),
    };
  }
  redirect(
    incomeListUrl({
      from: values.returnTo || undefined,
      receiveDate: values.receiveDate,
      savedId: values.incomeId,
    }),
  );
};

export const deleteIncome = async (formData: FormData): Promise<FormState> => {
  const id = formData.get("incomeId");
  if (!isString(id) || id === "") return { message: DELETE_FAILED_MESSAGE };
  const version = formData.get("version");
  if (!isString(version) || version === "")
    return { message: DELETE_CONFLICT_MESSAGE };
  try {
    await incomesApi.delete({ id, ifMatch: version });
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      updateTag("income");
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
  updateTag("income");
  return {};
};

export const loadIncomeForDelete = async (
  id: string,
): Promise<DeleteTargetResult> => {
  try {
    const response = await incomesApi.get({ id, extension: {} });
    return {
      target: {
        version: response.etag ?? "",
        details: [
          { label: "説明", value: response.description },
          { label: "金額", value: formatYen(response.amount) },
          { label: "受取日", value: response.receive_date },
          { label: "属性名", value: response.income_attribute.name },
        ],
      },
    };
  } catch (error) {
    console.error(error);
    return {
      message:
        error instanceof HttpError && error.status === 404
          ? DELETE_TARGET_MISSING_MESSAGE
          : DELETE_TARGET_LOAD_FAILED_MESSAGE,
    };
  }
};
