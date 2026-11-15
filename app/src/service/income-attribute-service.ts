"use server";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { incomeAttributesApi } from "@/lib/api/v1-income-attributes";
import {
  DELETE_TARGET_LOAD_FAILED_MESSAGE,
  DELETE_TARGET_MISSING_MESSAGE,
  type DeleteTargetResult,
} from "@/lib/delete-target";
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
import { first, maxLength, required } from "@/lib/form/validation";
import { HttpError } from "@/lib/http/error";
import type { IncomeAttribute, IncomeAttributes } from "@/lib/income-attribute";
import { isString } from "@/lib/type-guard";

export const getIncomeAttributes = async (): Promise<{
  incomeAttributes: IncomeAttributes;
  version: string;
}> => {
  const { response, etag } = await incomeAttributesApi.getList({
    extension: { next: { tags: ["income-attribute"] } },
  });
  return {
    incomeAttributes: response.income_attributes.map(({ id, name }) => ({
      id,
      name,
    })),
    version: etag,
  };
};

export const reorderIncomeAttributes = async ({
  from,
  to,
  version,
}: {
  from: number;
  to: number;
  version: string;
}): Promise<{ version?: string; message?: string }> => {
  try {
    const { etag } = await incomeAttributesApi.reorder({
      from,
      to,
      ifMatch: version,
    });
    updateTag("income-attribute");
    return { version: etag };
  } catch (error) {
    console.error(error);
    return { message: reorderFailureMessage(error) };
  }
};

export const getIncomeAttribute = async ({
  id,
  tag,
}: {
  id: string;
  tag: string;
}): Promise<IncomeAttribute> => {
  const response = await incomeAttributesApi.get({
    id,
    extension: {
      next: { tags: [tag] },
    },
  });
  const { id: attributeId, name } = response;
  return {
    id: attributeId,
    version: response.etag,
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
  let id: string;
  try {
    id = await incomeAttributesApi.post({ name: values.name });
  } catch (error) {
    console.error(error);
    return {
      values,
      message: failureMessage(error, SUBMIT_FAILED_MESSAGE),
    };
  }
  redirect(`/income-attribute?${new URLSearchParams({ saved: id })}`);
};

export const updateIncomeAttribute = async (
  _state: FormState,
  formData: FormData,
): Promise<FormState> => {
  const values = formValues(formData, ["incomeAttributeId", "version", "name"]);
  const errors = collectErrors({
    name: first(
      required(values.name, "属性名"),
      maxLength(values.name, 50, "属性名"),
    ),
  });
  if (errors) return { errors, values };
  if (!values.version) return { values, message: CONFLICT_MESSAGE };
  try {
    await incomeAttributesApi.put({
      ifMatch: values.version,
      id: values.incomeAttributeId,
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
    `/income-attribute?${new URLSearchParams({ saved: values.incomeAttributeId })}`,
  );
};

export const deleteIncomeAttribute = async (
  formData: FormData,
): Promise<FormState> => {
  const id = formData.get("incomeAttributeId");
  if (!isString(id) || id === "") return { message: DELETE_FAILED_MESSAGE };
  const version = formData.get("version");
  if (!isString(version) || version === "")
    return { message: DELETE_CONFLICT_MESSAGE };
  try {
    await incomeAttributesApi.delete({ id, ifMatch: version });
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      updateTag("income-attribute");
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
  updateTag("income-attribute");
  return {};
};

export const loadIncomeAttributeForDelete = async (
  id: string,
): Promise<DeleteTargetResult> => {
  try {
    const response = await incomeAttributesApi.get({ id, extension: {} });
    return {
      target: {
        version: response.etag ?? "",
        details: [{ label: "属性名", value: response.name }],
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
