import { balanceSeriesApi } from "@/lib/api/v1-balance-series";
import { balanceStatisticsApi } from "@/lib/api/v1-balance-statistics";
import {
  type BalancePoint,
  type BalanceStatistics,
  type Breakdown,
  toDateString,
} from "@/lib/balance";

const toBreakdown = (value: {
  total: number;
  breakdown: { attribute_id: string; attribute_name: string; amount: number }[];
}): Breakdown => ({
  total: value.total,
  items: value.breakdown.map(({ attribute_id, attribute_name, amount }) => ({
    id: attribute_id,
    name: attribute_name,
    amount,
  })),
});

/** 年（month を省略）または月の収支 */
export const getBalanceStatistics = async ({
  year,
  month,
  tag,
}: {
  year: number;
  month?: number;
  tag: string;
}): Promise<BalanceStatistics> => {
  const response = await balanceStatisticsApi.get({
    year,
    month,
    extension: { next: { tags: [tag] } },
  });
  return {
    income: toBreakdown(response.income),
    fixedExpense: toBreakdown(response.fixed_expense),
    variableExpense: toBreakdown(response.variable_expense),
    expenseTotal: response.expense_total,
    net: response.net,
  };
};

/** 月ごとの収支の推移（from の月の初めから to の月の終わりまで） */
export const getMonthlyBalanceSeries = async ({
  from,
  to,
  tag,
}: {
  from: Date;
  to: Date;
  tag: string;
}): Promise<BalancePoint[]> => {
  const response = await balanceSeriesApi.get({
    from: toDateString(from),
    to: toDateString(to),
    granularity: "month",
    extension: { next: { tags: [tag] } },
  });
  return response.items.map((item) => ({
    from: item.period.from,
    incomeTotal: item.income_total,
    expenseTotal: item.expense_total,
    net: item.net,
  }));
};
