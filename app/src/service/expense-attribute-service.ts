"use server";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { expenseAttributesApi } from "@/lib/api/v1-expense-attributes";
import {
  DELETE_TARGET_LOAD_FAILED_MESSAGE,
  DELETE_TARGET_MISSING_MESSAGE,
  type DeleteTargetResult,
} from "@/lib/delete-target";
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
  reorderFailureMessage,
  SUBMIT_FAILED_MESSAGE,
} from "@/lib/form/form-state";
import { first, maxLength, required, selected } from "@/lib/form/validation";
import { HttpError } from "@/lib/http/error";
import { isString } from "@/lib/type-guard";

export const getExpenseAttributes = async ({
  category,
}: {
  category?: string;
} = {}): Promise<{
  expenseAttributes: ExpenseAttributes;
  version: string;
}> => {
  const { response, etag } = await expenseAttributesApi.getList({
    category,
    extension: { next: { tags: ["expense-attribute"] } },
  });
  return {
    expenseAttributes: response.expense_attributes.map(
      ({ id, name, category }) => ({ id, name, category }),
    ),
    version: etag,
  };
};

export const reorderExpenseAttributes = async ({
  category,
  from,
  to,
  version,
}: {
  category: string;
  from: number;
  to: number;
  version: string;
}): Promise<{ version?: string; message?: string }> => {
  try {
    const { etag } = await expenseAttributesApi.reorder({
      category,
      from,
      to,
      ifMatch: version,
    });
    updateTag("expense-attribute");
    return { version: etag };
  } catch (error) {
    console.error(error);
    return { message: reorderFailureMessage(error) };
  }
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
  let id: string;
  try {
    id = await expenseAttributesApi.post({ name: values.name, category });
  } catch (error) {
    console.error(error);
    return {
      values,
      message: failureMessage(error, SUBMIT_FAILED_MESSAGE),
    };
  }
  redirect(
    `/expense-attribute?${new URLSearchParams({ category, saved: id })}`,
  );
};

export const updateExpenseAttribute = async (
  _state: FormState,
  formData: FormData,
): Promise<FormState> => {
  const values = formValues(formData, [
    "expenseAttributeId",
    "version",
    "name",
    "category",
  ]);
  const errors = collectErrors({
    name: first(
      required(values.name, "属性名"),
      maxLength(values.name, 50, "属性名"),
    ),
  });
  if (errors) return { errors, values };
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
  redirect(
    `/expense-attribute?${new URLSearchParams({ category: values.category, saved: values.expenseAttributeId })}`,
  );
};

export const deleteExpenseAttribute = async (
  formData: FormData,
): Promise<FormState> => {
  const id = formData.get("expenseAttributeId");
  if (!isString(id) || id === "") return { message: DELETE_FAILED_MESSAGE };
  const version = formData.get("version");
  if (!isString(version) || version === "")
    return { message: DELETE_CONFLICT_MESSAGE };
  try {
    await expenseAttributesApi.delete({ id, ifMatch: version });
  } catch (error) {
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

export const loadExpenseAttributeForDelete = async (
  id: string,
): Promise<DeleteTargetResult> => {
  try {
    const response = await expenseAttributesApi.get({ id, extension: {} });
    return {
      target: {
        version: response.etag ?? "",
        details: [
          { label: "属性名", value: response.name },
          { label: "分類", value: response.category },
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
