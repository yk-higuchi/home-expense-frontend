export interface IncomeAttribute {
  id?: string;
  /** データのバージョン（取得時の ETag。更新時の If-Match に使う） */
  version?: string;
  name: string;
}

export type IncomeAttributes = IncomeAttribute[];
