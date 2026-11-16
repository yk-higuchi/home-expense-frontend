import type { ReactElement, ReactNode } from "react";
import style from "@/ui/parts/page-heading.module.css";

export const PageHeading = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => <h1 className={style.heading}>{children}</h1>;

export const withHeading =
  <P,>(
    title: string,
    Page: (props: P) => ReactElement | Promise<ReactElement>,
  ) =>
  async (props: P): Promise<ReactElement> => (
    <>
      <PageHeading>{title}</PageHeading>
      {await Page(props)}
    </>
  );
