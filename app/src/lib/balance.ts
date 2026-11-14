/** 収支の集計（balance-statistics / balance-series）を画面で使う形 */

export interface AttributeAmount {
  id: string;
  name: string;
  amount: number;
}

export interface Breakdown {
  total: number;
  /** 金額の多い順（その期間にデータのない属性は含まれない） */
  items: AttributeAmount[];
}

export interface BalanceStatistics {
  income: Breakdown;
  fixedExpense: Breakdown;
  variableExpense: Breakdown;
  expenseTotal: number;
  /** 収入 − 支出（マイナスもあり得る） */
  net: number;
}

export interface BalancePoint {
  /** 期間の始まり（yyyy-MM-dd） */
  from: string;
  incomeTotal: number;
  expenseTotal: number;
  net: number;
}

/** yyyy-MM-dd */
export const toDateString = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** yyyy-MM-dd から「10月」 */
export const monthLabel = (from: string): string =>
  `${Number(from.slice(5, 7))}月`;
