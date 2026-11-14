"use server";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { incomeAttributesApi } from "@/lib/api/v1-income-attributes";
import {
  collectErrors,
  type FormState,
  formValues,
  SUBMIT_FAILED_MESSAGE,
} from "@/lib/form/form-state";
import { first, maxLength, required } from "@/lib/form/validation";
import type { IncomeAttribute, IncomeAttributes } from "@/lib/income-attribute";
import type { Pagination } from "@/lib/pagination/pagination";
import { isString } from "@/lib/type-guard";

export const getIncomeAttributeSummary = async ({
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
  incomeAttributes: IncomeAttributes;
  pagination: Pagination;
}> => {
  const { pagination, response } = await incomeAttributesApi.getSummary({
    category,
    page,
    perPage,
    extension: {
      next: { tags: [tag] },
    },
  });
  const { income_attributes: incomeAttributes } = response;
  const _incomeAttributes: IncomeAttributes = incomeAttributes.map((value) => {
    const { id, name } = value;
    const incomeAttribute: IncomeAttribute = {
      id,
      name,
    };
    return incomeAttribute;
  });
  return {
    incomeAttributes: _incomeAttributes,
    pagination,
  };
};

export const getIncomeAttribute = async ({
  id,
  tag,
}: {
  id: string;
  tag: string;
}): Promise<IncomeAttribute> => {
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  const response = await incomeAttributesApi.get({
    id,
    extension: {
      next: { tags: [tag] },
    },
  });
  const { id: attributeId, name } = response;
  return {
    id: attributeId,
    name,
  };
};

export const registerIncomeAttribute = async (
  _state: FormState,
  formData: FormData,
): Promise<FormState> => {
  const values = formValues(formData, ["name"]);
  const errors = collectErrors({
    name: first(
      required(values.name, "属性名"),
      maxLength(values.name, 50, "属性名"),
    ),
  });
  if (errors) return { errors, values };
  try {
    await incomeAttributesApi.post({ name: values.name });
  } catch (error) {
    console.error(error);
    return { values, message: SUBMIT_FAILED_MESSAGE };
  }
  redirect("/income-attribute");
};

export const updateIncomeAttribute = async (
  _state: FormState,
  formData: FormData,
): Promise<FormState> => {
  const values = formValues(formData, ["incomeAttributeId", "name"]);
  const errors = collectErrors({
    name: first(
      required(values.name, "属性名"),
      maxLength(values.name, 50, "属性名"),
    ),
  });
  if (errors) return { errors, values };
  try {
    await incomeAttributesApi.put({
      id: values.incomeAttributeId,
      name: values.name,
    });
  } catch (error) {
    console.error(error);
    return { values, message: SUBMIT_FAILED_MESSAGE };
  }
  redirect("/income-attribute");
};

export const deleteIncomeAttribute = async (
  formData: FormData,
): Promise<void> => {
  const id = formData.get("incomeAttributeId");
  if (isString(id)) {
    await incomeAttributesApi.delete({ id });
    updateTag("income-attribute");
  }
};
