import "server-only";
import {
  type BalancePoint,
  type BalanceStatistics,
  type Breakdown,
  toDateString,
} from "@/core/balance";
import { balanceSeriesApi } from "@/network/api/v1-balance-series";
import { balanceStatisticsApi } from "@/network/api/v1-balance-statistics";

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
