export const BalanceSeriesResponse = {
  properties: {
    granularity: { enum: ["day", "week", "month", "quarter", "year"] },
    items: {
      elements: {
        properties: {
          expense_total: { type: "float64" },
          fixed_expense_total: { type: "float64" },
          income_total: { type: "float64" },
          net: { type: "float64" },
          period: {
            properties: { from: { type: "string" }, to: { type: "string" } },
            additionalProperties: true,
          },
          variable_expense_total: { type: "float64" },
        },
        additionalProperties: true,
      },
    },
  },
  additionalProperties: true,
} as const;

export const BalanceStatisticsResponse = {
  properties: {
    expense_total: { type: "float64" },
    fixed_expense: {
      properties: {
        breakdown: {
          elements: {
            properties: {
              amount: { type: "float64" },
              attribute_id: { type: "string" },
              attribute_name: { type: "string" },
            },
            additionalProperties: true,
          },
        },
        total: { type: "float64" },
      },
      additionalProperties: true,
    },
    income: {
      properties: {
        breakdown: {
          elements: {
            properties: {
              amount: { type: "float64" },
              attribute_id: { type: "string" },
              attribute_name: { type: "string" },
            },
            additionalProperties: true,
          },
        },
        total: { type: "float64" },
      },
      additionalProperties: true,
    },
    net: { type: "float64" },
    period: {
      properties: { from: { type: "string" }, to: { type: "string" } },
      additionalProperties: true,
    },
    variable_expense: {
      properties: {
        breakdown: {
          elements: {
            properties: {
              amount: { type: "float64" },
              attribute_id: { type: "string" },
              attribute_name: { type: "string" },
            },
            additionalProperties: true,
          },
        },
        total: { type: "float64" },
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
} as const;

export const ExpenseAttributeGetResponse = {
  properties: {
    category: { enum: ["固定費", "変動費"] },
    id: { type: "string" },
    name: { type: "string" },
    version: { type: "float64" },
  },
  additionalProperties: true,
} as const;

export const ExpenseAttributeListResponse = {
  properties: {
    expense_attributes: {
      elements: {
        properties: {
          category: { enum: ["固定費", "変動費"] },
          id: { type: "string" },
          name: { type: "string" },
          version: { type: "float64" },
        },
        additionalProperties: true,
      },
    },
  },
  additionalProperties: true,
} as const;

export const ExpenseAttributePostRequest = {
  properties: {
    category: { enum: ["固定費", "変動費"] },
    name: { type: "string" },
  },
} as const;

export const ExpenseAttributePutRequest = {
  properties: { name: { type: "string" } },
} as const;

export const ExpenseGetResponse = {
  properties: {
    amount: { type: "int32" },
    description: { type: "string" },
    expense_attribute: {
      properties: {
        category: { enum: ["固定費", "変動費"] },
        id: { type: "string" },
        name: { type: "string" },
      },
      additionalProperties: true,
    },
    id: { type: "string" },
    payment_date: { type: "string" },
    version: { type: "float64" },
  },
  additionalProperties: true,
} as const;

export const ExpenseListResponse = {
  properties: {
    expenses: {
      elements: {
        properties: {
          amount: { type: "int32" },
          description: { type: "string" },
          expense_attribute: {
            properties: {
              category: { enum: ["固定費", "変動費"] },
              id: { type: "string" },
              name: { type: "string" },
            },
            additionalProperties: true,
          },
          id: { type: "string" },
          payment_date: { type: "string" },
          version: { type: "float64" },
        },
        additionalProperties: true,
      },
    },
  },
  additionalProperties: true,
} as const;

export const ExpensePostRequest = {
  properties: {
    amount: { type: "int32" },
    attribute_id: { type: "string" },
    description: { type: "string" },
    payment_date: { type: "string" },
  },
} as const;

export const ExpensePutRequest = {
  properties: {
    amount: { type: "int32" },
    attribute_id: { type: "string" },
    description: { type: "string" },
    payment_date: { type: "string" },
  },
} as const;

export const IncomeAttributeGetResponse = {
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    version: { type: "float64" },
  },
  additionalProperties: true,
} as const;

export const IncomeAttributeListResponse = {
  properties: {
    income_attributes: {
      elements: {
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          version: { type: "float64" },
        },
        additionalProperties: true,
      },
    },
  },
  additionalProperties: true,
} as const;

export const IncomeAttributePostRequest = {
  properties: { name: { type: "string" } },
} as const;

export const IncomeAttributePutRequest = {
  properties: { name: { type: "string" } },
} as const;

export const IncomeGetResponse = {
  properties: {
    amount: { type: "int32" },
    description: { type: "string" },
    id: { type: "string" },
    income_attribute: {
      properties: { id: { type: "string" }, name: { type: "string" } },
      additionalProperties: true,
    },
    receive_date: { type: "string" },
    version: { type: "float64" },
  },
  additionalProperties: true,
} as const;

export const IncomeListResponse = {
  properties: {
    incomes: {
      elements: {
        properties: {
          amount: { type: "int32" },
          description: { type: "string" },
          id: { type: "string" },
          income_attribute: {
            properties: { id: { type: "string" }, name: { type: "string" } },
            additionalProperties: true,
          },
          receive_date: { type: "string" },
          version: { type: "float64" },
        },
        additionalProperties: true,
      },
    },
  },
  additionalProperties: true,
} as const;

export const IncomePostRequest = {
  properties: {
    amount: { type: "int32" },
    attribute_id: { type: "string" },
    description: { type: "string" },
    receive_date: { type: "string" },
  },
} as const;

export const IncomePutRequest = {
  properties: {
    amount: { type: "int32" },
    attribute_id: { type: "string" },
    description: { type: "string" },
    receive_date: { type: "string" },
  },
} as const;

export const ProblemDetail = {
  properties: {
    status: { type: "int32" },
    title: { type: "string" },
    type: { type: "string" },
  },
  optionalProperties: {
    detail: { type: "string" },
    trace_id: { type: "string" },
  },
  additionalProperties: true,
} as const;
