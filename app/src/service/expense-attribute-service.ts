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
  collectErrors,
  type FormState,
  formValues,
  SUBMIT_FAILED_MESSAGE,
} from "@/lib/form/form-state";
import { first, maxLength, required, selected } from "@/lib/form/validation";
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
      const { id, name, category } = value;
      const expenseAttribute: ExpenseAttribute = {
        id,
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
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  const response = await expenseAttributesApi.get({
    id,
    extension: {
      next: { tags: [tag] },
    },
  });
  const { id: attributeId, name, category } = response;
  return {
    id: attributeId,
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
    return { values, message: SUBMIT_FAILED_MESSAGE };
  }
  redirect("/expense-attribute");
};

export const updateExpenseAttribute = async (
  _state: FormState,
  formData: FormData,
): Promise<FormState> => {
  const values = formValues(formData, [
    "expenseAttributeId",
    "name",
    "category",
  ]);
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
    await expenseAttributesApi.put({
      id: values.expenseAttributeId,
      name: values.name,
      category,
    });
  } catch (error) {
    console.error(error);
    return { values, message: SUBMIT_FAILED_MESSAGE };
  }
  redirect("/expense-attribute");
};

export const deleteExpenseAttribute = async (
  formData: FormData,
): Promise<void> => {
  const id = formData.get("expenseAttributeId");
  if (isString(id)) {
    await expenseAttributesApi.delete({ id });
    updateTag("expense-attribute");
  }
};
