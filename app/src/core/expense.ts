export interface Expense {
  id?: string;
  version?: string;
  description: string;
  amount: number;
  paymentDate: string;
  attributeId?: string;
  attributeName?: string;
  category?: string;
}

export type Expenses = Expense[];
