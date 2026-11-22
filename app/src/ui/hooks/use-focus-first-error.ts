"use client";

import { type RefObject, useEffect, useRef } from "react";
import type { FormState } from "@/core/form/form-state";

export const useFocusFirstError = (
  state: FormState,
): RefObject<HTMLFormElement | null> => {
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.errors === undefined) return;
    form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);
  return form;
};
