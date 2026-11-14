export interface Income {
  id?: string;
  /** データのバージョン（取得時の ETag。更新時の If-Match に使う） */
  version?: string;
  description: string;
  amount: number;
  receiveDate: string;
  attributeId?: string;
  attributeName?: string;
}

export type Incomes = Income[];
