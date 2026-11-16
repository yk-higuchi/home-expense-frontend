import "server-only";
import type {
  ExpenseAttribute,
  ExpenseAttributes,
} from "@/core/expense-attribute";
import { expenseAttributesApi } from "@/network/api/v1-expense-attributes";

export const getExpenseAttributes = async ({
  category,
}: {
  category?: string;
} = {}): Promise<{
  expenseAttributes: ExpenseAttributes;
  version: string;
}> => {
  const { response, etag } = await expenseAttributesApi.getList({
    category,
    extension: { next: { tags: ["expense-attribute"] } },
  });
  return {
    expenseAttributes: response.expense_attributes.map(
      ({ id, name, category }) => ({ id, name, category }),
    ),
    version: etag,
  };
};

export const getExpenseAttribute = async ({
  id,
  tag,
}: {
  id: string;
  tag: string;
}): Promise<ExpenseAttribute> => {
  const response = await expenseAttributesApi.get({
    id,
    extension: {
      next: { tags: [tag] },
    },
  });
  const { id: attributeId, name, category } = response;
  return {
    id: attributeId,
    version: response.etag,
    name,
    category,
  };
};
