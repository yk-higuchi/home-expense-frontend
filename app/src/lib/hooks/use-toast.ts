"use client";

import type { ToastNotice } from "@home-expense/ui";
import { useState } from "react";

let sequence = 0;

export interface ToastControl {
  success: (text: string) => void;
  error: (text: string) => void;
  clear: () => void;
}

export const useToast = (initial: ToastNotice | null = null) => {
  const [notice, setNotice] = useState(initial);
  const control: ToastControl = {
    success: (text) => {
      sequence += 1;
      setNotice({ id: sequence, text, tone: "success" });
    },
    error: (text) => {
      sequence += 1;
      setNotice({ id: sequence, text, tone: "error" });
    },
    clear: () => setNotice(null),
  };
  return { notice, ...control };
};
