interface AttributeAmount {
  id: string;
  name: string;
  amount: number;
}

export interface Breakdown {
  total: number;
  items: AttributeAmount[];
}

export interface BalanceStatistics {
  income: Breakdown;
  fixedExpense: Breakdown;
  variableExpense: Breakdown;
  expenseTotal: number;
  net: number;
}

export interface BalancePoint {
  from: string;
  incomeTotal: number;
  expenseTotal: number;
  net: number;
}

export const toDateString = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const monthLabel = (from: string): string =>
  `${Number(from.slice(5, 7))}月`;
