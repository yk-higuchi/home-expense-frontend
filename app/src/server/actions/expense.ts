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
import { expensesApi } from "@/network/api/v1-expenses";
import { HttpError } from "@/network/http/error";
import { failureMessage } from "@/server/actions/failure";
import { expenseListUrl } from "@/server/actions/list-return";

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
    "returnTo",
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
  let id: string;
  try {
    id = await expensesApi.post({
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
  redirect(
    expenseListUrl({
      from: values.returnTo || undefined,
      paymentDate: values.paymentDate,
      category: values.category,
      attributeId: values.attributeId,
      savedId: id,
    }),
  );
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
    "returnTo",
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
  redirect(
    expenseListUrl({
      from: values.returnTo || undefined,
      paymentDate: values.paymentDate,
      category: values.category,
      attributeId: values.attributeId,
      savedId: values.expenseId,
    }),
  );
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

export const loadExpenseForDelete = async (
  id: string,
): Promise<DeleteTargetResult> => {
  try {
    const response = await expensesApi.get({ id, extension: {} });
    return {
      target: {
        version: response.etag ?? "",
        details: [
          { label: "説明", value: response.description },
          { label: "金額", value: formatYen(response.amount) },
          { label: "支払日", value: response.payment_date },
          { label: "属性名", value: response.expense_attribute.name },
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
