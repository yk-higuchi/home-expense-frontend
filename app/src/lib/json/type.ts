import type { Schemas } from "@/lib/api/generated/types";

export type SchemaName = keyof Schemas;
export type Schema<N extends SchemaName> = Schemas[N];
