import type { ReactElement, SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  /** 一辺の大きさ（px） */
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

/** 追加（SDS の Plus アイコン） */
export const PlusIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
);
