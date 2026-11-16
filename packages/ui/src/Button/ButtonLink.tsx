import type { ComponentType, ReactElement, ReactNode } from "react";

import type { ButtonVariant } from "./Button";
import styles from "./Button.module.css";

export interface ButtonLinkComponentProps {
  href: string;
  className?: string;
  children?: ReactNode;
}

export interface ButtonLinkProps {
  href: string;
  variant?: ButtonVariant;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
  linkComponent?: ComponentType<ButtonLinkComponentProps>;
}

const Anchor = ({
  children,
  ...props
}: ButtonLinkComponentProps): ReactElement => <a {...props}>{children}</a>;

export const ButtonLink = ({
  href,
  variant = "primary",
  icon,
  className,
  children,
  linkComponent: Link = Anchor,
}: ButtonLinkProps): ReactElement => (
  <Link
    href={href}
    className={[styles.button, styles[variant], className]
      .filter(Boolean)
      .join(" ")}
  >
    {icon}
    {children}
  </Link>
);
