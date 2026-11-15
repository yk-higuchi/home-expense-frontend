import type { ReactElement, SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  size?: number;
};

const Icon = ({
  size = 16,
  children,
  ...rest
}: IconProps & { children: ReactElement | ReactElement[] }): ReactElement => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

export const PlusIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
);

export const LoaderIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M4.93 4.93l2.83 2.83" />
    <path d="M16.24 16.24l2.83 2.83" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M4.93 19.07l2.83-2.83" />
    <path d="M16.24 7.76l2.83-2.83" />
  </Icon>
);

export const WarningIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </Icon>
);

export const GripIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <circle cx="9" cy="6" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="6" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="9" cy="18" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="18" r="1.5" fill="currentColor" stroke="none" />
  </Icon>
);

export const ChevronUpIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <path d="M6 15l6-6 6 6" />
  </Icon>
);

export const ChevronDownIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

export const CheckIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);
