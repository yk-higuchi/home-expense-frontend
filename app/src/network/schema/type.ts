import type { Schemas } from "@/network/generated/types";

export type SchemaName = keyof Schemas;
export type Schema<N extends SchemaName> = Schemas[N];
