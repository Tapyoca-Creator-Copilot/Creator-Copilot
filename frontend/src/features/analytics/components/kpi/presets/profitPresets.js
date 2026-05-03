import { Percent, Scale, TrendingUp } from "lucide-react";

export const buildProfitTabCards = ({ currencyFormatter, totalEarnings, netProfit, profitMargin }) => [
  {
    name: "Total Earnings",
    stat: currencyFormatter(totalEarnings),
    rawValue: totalEarnings,
    formatter: currencyFormatter,
    icon: TrendingUp,
    helper: "Total earnings in range",
  },
  {
    name: "Net Profit",
    stat: currencyFormatter(netProfit),
    rawValue: netProfit,
    formatter: currencyFormatter,
    icon: Scale,
    helper: netProfit >= 0 ? "Above break-even" : "Below break-even",
    badge: netProfit >= 0 ? "Profitable" : "In the red",
    badgeType: netProfit >= 0 ? "positive" : "negative",
  },
  {
    name: "Profit Margin",
    stat: totalEarnings > 0 ? `${profitMargin.toFixed(1)}%` : "—",
    rawValue: totalEarnings > 0 ? profitMargin : null,
    formatter: (v) => `${v.toFixed(1)}%`,
    icon: Percent,
    helper: totalEarnings > 0 ? "Of earnings kept after expenses" : "Log earnings to calculate",
    badge: totalEarnings > 0 ? (profitMargin >= 50 ? "Healthy" : profitMargin >= 20 ? "Moderate" : "Low") : "—",
    badgeType: totalEarnings > 0 && profitMargin >= 20 ? "positive" : "negative",
  },
];
