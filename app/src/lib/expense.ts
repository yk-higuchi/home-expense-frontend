export interface Expense {
  id?: string;
  /** データのバージョン（取得時の ETag。更新時の If-Match に使う） */
  version?: string;
  description: string;
  amount: number;
  paymentDate: string;
  attributeId?: string;
  attributeName?: string;
  category?: string;
}

export type Expenses = Expense[];
