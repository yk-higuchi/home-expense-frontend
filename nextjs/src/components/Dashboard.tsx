"use client";
import { lazy, use } from "react";

type Props = {
  promise: Promise<{ name: string; version: string }[]>;
};
const Dashboard = ({ promise }: Props) => {
  const list = use(promise);
  const components = list.map((value) => {
    const Foo = lazy(
      () => import(`@/components/button/${value.version}/${value.name}`),
    );
    return <Foo />;
  });
  return <div>{components}</div>;
};
export default Dashboard;
