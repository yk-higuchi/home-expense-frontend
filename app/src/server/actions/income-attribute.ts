"use server";
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
import { first, maxLength, required } from "@/core/form/validation";
import { isString } from "@/core/type-guard";
import { incomeAttributesApi } from "@/network/api/v1-income-attributes";
import { HttpError } from "@/network/http/error";
import {
  failureMessage,
  reorderFailureMessage,
} from "@/server/actions/failure";

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
