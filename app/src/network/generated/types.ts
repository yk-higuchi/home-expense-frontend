export interface Schemas {
  AttributeAmountResponse: {
    amount: number;
    attribute_id: string;
    attribute_name: string;
  };
  AttributeBreakdownResponse: {
    breakdown: Schemas["AttributeAmountResponse"][];
    total: number;
  };
  BalanceSeriesPointResponse: {
    expense_total: number;
    fixed_expense_total: number;
    income_total: number;
    net: number;
    period: Schemas["PeriodResponse"];
    variable_expense_total: number;
  };
  BalanceSeriesResponse: {
    granularity: "day" | "week" | "month" | "quarter" | "year";
    items: Schemas["BalanceSeriesPointResponse"][];
  };
  BalanceStatisticsResponse: {
    expense_total: number;
    fixed_expense: Schemas["AttributeBreakdownResponse"];
    income: Schemas["AttributeBreakdownResponse"];
    net: number;
    period: Schemas["PeriodResponse"];
    variable_expense: Schemas["AttributeBreakdownResponse"];
  };
  ExpenseAttributeGetResponse: {
    category: "固定費" | "変動費";
    id: string;
    name: string;
  };
  ExpenseAttributeListPatchRequest: Schemas["ExpenseAttributeMoveOperation"][];
  ExpenseAttributeListResponse: {
    expense_attributes: Schemas["ExpenseAttributeGetResponse"][];
  };
  ExpenseAttributeMoveOperation: { from: string; op: "move"; path: string };
  ExpenseAttributePostRequest: { category: "固定費" | "変動費"; name: string };
  ExpenseAttributePutRequest: { name: string };
  ExpenseAttributeResponse: {
    category: "固定費" | "変動費";
    id: string;
    name: string;
  };
  ExpenseGetResponse: {
    amount: number;
    description: string;
    expense_attribute: Schemas["ExpenseAttributeResponse"];
    id: string;
    payment_date: string;
  };
  ExpenseListResponse: { expenses: Schemas["ExpenseGetResponse"][] };
  ExpensePostRequest: {
    amount: number;
    attribute_id: string;
    description: string;
    payment_date: string;
  };
  ExpensePutRequest: {
    amount: number;
    attribute_id: string;
    description: string;
    payment_date: string;
  };
  IncomeAttributeGetResponse: { id: string; name: string };
  IncomeAttributeListPatchRequest: Schemas["IncomeAttributeMoveOperation"][];
  IncomeAttributeListResponse: {
    income_attributes: Schemas["IncomeAttributeGetResponse"][];
  };
  IncomeAttributeMoveOperation: { from: string; op: "move"; path: string };
  IncomeAttributePostRequest: { name: string };
  IncomeAttributePutRequest: { name: string };
  IncomeAttributeResponse: { id: string; name: string };
  IncomeGetResponse: {
    amount: number;
    description: string;
    id: string;
    income_attribute: Schemas["IncomeAttributeResponse"];
    receive_date: string;
  };
  IncomeListResponse: { incomes: Schemas["IncomeGetResponse"][] };
  IncomePostRequest: {
    amount: number;
    attribute_id: string;
    description: string;
    receive_date: string;
  };
  IncomePutRequest: {
    amount: number;
    attribute_id: string;
    description: string;
    receive_date: string;
  };
  PeriodResponse: { from: string; to: string };
  ProblemDetail: {
    detail?: string;
    status: number;
    title: string;
    trace_id?: string;
    type: string;
  };
}
