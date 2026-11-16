"use server";
import { formatYen } from "@home-expense/ui/format";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  DELETE_TARGET_LOAD_FAILED_MESSAGE,
  DELETE_TARGET_MISSING_MESSAGE,
  type DeleteTargetResult,
} from "@/core/delete-target";
import {
  CONFLICT_MESSAGE,
  collectErrors,
  DELETE_CONFLICT_MESSAGE,
  DELETE_FAILED_MESSAGE,
  type FormState,
  formValues,
  SUBMIT_FAILED_MESSAGE,
} from "@/core/form/form-state";
import {
  amount,
  date,
  first,
  maxLength,
  parseAmount,
  required,
  selected,
} from "@/core/form/validation";
import { isString } from "@/core/type-guard";
import { incomesApi } from "@/network/api/v1-incomes";
import { HttpError } from "@/network/http/error";
import { failureMessage } from "@/server/actions/failure";
import { incomeListUrl } from "@/server/actions/list-return";

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
