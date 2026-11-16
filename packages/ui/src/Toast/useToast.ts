"use client";

import { useState } from "react";

import type { ToastNotice } from "./Toast";

let sequence = 0;

export interface ToastControl {
  success: (text: string) => void;
  error: (text: string) => void;
  clear: () => void;
}

export const useToast = (
  initial: ToastNotice | null = null,
): ToastControl & { notice: ToastNotice | null } => {
  const [notice, setNotice] = useState(initial);
  const show = (text: string, tone: ToastNotice["tone"]): void => {
    sequence += 1;
    setNotice({ id: sequence, text, tone });
  };
  return {
    notice,
    success: (text) => show(text, "success"),
    error: (text) => show(text, "error"),
    clear: () => setNotice(null),
  };
};
