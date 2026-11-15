"use client";

import type { ReactElement } from "react";
import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "../Button/Button";

export type SubmitButtonProps = Omit<ButtonProps, "type" | "loading">;

export const SubmitButton = (props: SubmitButtonProps): ReactElement => {
  const { pending } = useFormStatus();
  return <Button type="submit" loading={pending} {...props} />;
};
