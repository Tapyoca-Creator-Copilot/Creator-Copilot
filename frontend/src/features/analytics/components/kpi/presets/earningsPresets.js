import { BarChart2, DollarSign, Scale, Target, TrendingUp } from "lucide-react";

export const buildEarningsTabCards = ({
  currencyFormatter,
  totalEarnings,
  avgEarning,
  earningsCount,
  spentAmount,
}) => [
  {
    name: "Total Earnings",
    stat: currencyFormatter(totalEarnings),
    rawValue: totalEarnings,
    formatter: currencyFormatter,
    icon: TrendingUp,
    helper: `Across ${earningsCount} earning${earningsCount !== 1 ? "s" : ""}`,
  },
  {
    name: "Break-even Coverage",
    stat: spentAmount > 0 ? `${((totalEarnings / spentAmount) * 100).toFixed(1)}%` : totalEarnings > 0 ? "100.0%" : "—",
    rawValue: spentAmount > 0 ? (totalEarnings / spentAmount) * 100 : totalEarnings > 0 ? 100 : null,
    formatter: (v) => `${v.toFixed(1)}%`,
    icon: Target,
    helper: spentAmount > 0 ? "Earnings compared with expenses" : "No expenses to cover",
    badge: spentAmount > 0
      ? totalEarnings >= spentAmount ? "Covered" : "Short"
      : totalEarnings > 0 ? "Clear" : "No coverage",
    badgeType: spentAmount > 0
      ? totalEarnings >= spentAmount ? "positive" : "negative"
      : totalEarnings > 0 ? "positive" : "negative",
  },
  {
    name: "Avg. Earning",
    stat: currencyFormatter(avgEarning),
    rawValue: avgEarning,
    formatter: currencyFormatter,
    icon: DollarSign,
    helper: "Per earning logged",
    badge: earningsCount > 0 ? "Avg active" : "No average",
    badgeType: earningsCount > 0 ? "positive" : "negative",
  },
];

export const buildEarningKpiCards = ({ kpiData }) => [
  {
    name: "Total Earnings",
    stat: kpiData.totalEarned,
    rawValue: kpiData.totalEarnedRaw,
    formatter: kpiData.currencyFmt,
    helper: kpiData.totalEarnedHelper,
    badge: kpiData.totalEarnedBadge,
    badgeType: kpiData.totalEarnedBadgeType,
    icon: TrendingUp,
  },
  {
    name: "Net Profit",
    stat: kpiData.profit,
    rawValue: kpiData.profitRaw,
    formatter: kpiData.currencyFmt,
    helper: kpiData.profitHelper,
    badge: kpiData.profitBadge,
    badgeType: kpiData.profitBadgeType,
    icon: Scale,
  },
  {
    name: "Avg. per Entry",
    stat: kpiData.avgEarning,
    rawValue: kpiData.avgEarningRaw,
    formatter: kpiData.currencyFmt,
    helper: kpiData.avgEarningHelper,
    badge: kpiData.avgEarningBadge,
    badgeType: kpiData.avgEarningBadgeType,
    icon: BarChart2,
  },
];
