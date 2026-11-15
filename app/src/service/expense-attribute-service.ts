"use server";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { expenseAttributesApi } from "@/lib/api/v1-expense-attributes";
import {
  type ExpenseAttribute,
  type ExpenseAttributes,
  isExpenseAttributeCategory,
} from "@/lib/expense-attribute";
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
import { first, maxLength, required, selected } from "@/lib/form/validation";
import { HttpError } from "@/lib/http/error";
import type { Pagination } from "@/lib/pagination/pagination";
import { isString } from "@/lib/type-guard";

export const getExpenseAttributeSummary = async ({
  category,
  page,
  perPage,
  tag,
}: {
  category?: string;
  page: number;
  perPage: number;
  tag: string;
}): Promise<{
  expenseAttributes: ExpenseAttributes;
  pagination: Pagination;
}> => {
  const { pagination, response } = await expenseAttributesApi.getSummary({
    category,
    page,
    perPage,
    extension: {
      next: { tags: [tag] },
    },
  });
  const { expense_attributes: expenseAttributes } = response;
  const _expenseAttributes: ExpenseAttributes = expenseAttributes.map(
    (value) => {
      const { id, version, name, category } = value;
      const expenseAttribute: ExpenseAttribute = {
        id,
        // ETag と同じ形（"3"）にして、削除の If-Match にそのまま使う
        version: `"${version}"`,
        name,
        category,
      };
      return expenseAttribute;
    },
  );
  return {
    expenseAttributes: _expenseAttributes,
    pagination,
  };
};

export const getExpenseAttribute = async ({
  id,
  tag,
}: {
  id: string;
  tag: string;
}): Promise<ExpenseAttribute> => {
  const response = await expenseAttributesApi.get({
    id,
    extension: {
      next: { tags: [tag] },
    },
  });
  const { id: attributeId, name, category } = response;
  return {
    id: attributeId,
    version: response.etag,
    name,
    category,
  };
};

export const registerExpenseAttribute = async (
  _state: FormState,
  formData: FormData,
): Promise<FormState> => {
  const values = formValues(formData, ["name", "category"]);
  const { category } = values;
  const errors = collectErrors({
    name: first(
      required(values.name, "属性名"),
      maxLength(values.name, 50, "属性名"),
    ),
    category: selected(category, "分類"),
  });
  if (errors || !isExpenseAttributeCategory(category)) {
    return { errors: errors ?? { category: "分類を選択してください" }, values };
  }
  try {
    await expenseAttributesApi.post({ name: values.name, category });
  } catch (error) {
    console.error(error);
    return {
      values,
      message: failureMessage(error, SUBMIT_FAILED_MESSAGE),
    };
  }
  redirect("/expense-attribute");
};

export const updateExpenseAttribute = async (
  _state: FormState,
  formData: FormData,
): Promise<FormState> => {
  const values = formValues(formData, [
    "expenseAttributeId",
    "version",
    "name",
  ]);
  // 分類は登録後に変更できないため、属性名だけを送る
  const errors = collectErrors({
    name: first(
      required(values.name, "属性名"),
      maxLength(values.name, 50, "属性名"),
    ),
  });
  if (errors) return { errors, values };
  // 取得時のバージョンがないと、ほかの操作による更新を検出できない
  if (!values.version) return { values, message: CONFLICT_MESSAGE };
  try {
    await expenseAttributesApi.put({
      ifMatch: values.version,
      id: values.expenseAttributeId,
      name: values.name,
    });
  } catch (error) {
    console.error(error);
    return {
      values,
      message: failureMessage(error, SUBMIT_FAILED_MESSAGE),
    };
  }
  redirect("/expense-attribute");
};

export const deleteExpenseAttribute = async (
  formData: FormData,
): Promise<FormState> => {
  const id = formData.get("expenseAttributeId");
  if (!isString(id) || id === "") return { message: DELETE_FAILED_MESSAGE };
  // 一覧で表示したときのバージョン。ないと、ほかの操作による更新を検出できない
  const version = formData.get("version");
  if (!isString(version) || version === "")
    return { message: DELETE_CONFLICT_MESSAGE };
  try {
    await expenseAttributesApi.delete({ id, ifMatch: version });
  } catch (error) {
    // すでに削除されている（404）ときは、削除できたときと同じく一覧を取得し直す
    if (error instanceof HttpError && error.status === 404) {
      updateTag("expense-attribute");
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
  updateTag("expense-attribute");
  return {};
};
