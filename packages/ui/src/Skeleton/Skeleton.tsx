import type { CSSProperties, ReactElement } from "react";

import styles from "./Skeleton.module.css";

export interface SkeletonProps {
  width?: CSSProperties["width"];
  className?: string;
}

export const Skeleton = ({
  width = 120,
  className,
}: SkeletonProps): ReactElement => (
  <span
    className={[styles.skeleton, className].filter(Boolean).join(" ")}
    style={{ width }}
    aria-hidden="true"
  />
);
