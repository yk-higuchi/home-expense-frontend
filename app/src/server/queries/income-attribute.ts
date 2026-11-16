import "server-only";
import type {
  IncomeAttribute,
  IncomeAttributes,
} from "@/core/income-attribute";
import { incomeAttributesApi } from "@/network/api/v1-income-attributes";

export const getIncomeAttributes = async (): Promise<{
  incomeAttributes: IncomeAttributes;
  version: string;
}> => {
  const { response, etag } = await incomeAttributesApi.getList({
    extension: { next: { tags: ["income-attribute"] } },
  });
  return {
    incomeAttributes: response.income_attributes.map(({ id, name }) => ({
      id,
      name,
    })),
    version: etag,
  };
};

export const getIncomeAttribute = async ({
  id,
  tag,
}: {
  id: string;
  tag: string;
}): Promise<IncomeAttribute> => {
  const response = await incomeAttributesApi.get({
    id,
    extension: {
      next: { tags: [tag] },
    },
  });
  const { id: attributeId, name } = response;
  return {
    id: attributeId,
    version: response.etag,
    name,
  };
};
