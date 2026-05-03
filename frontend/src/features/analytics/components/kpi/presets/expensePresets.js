import { Briefcase, CreditCard, Target } from "lucide-react";

export const buildExpenseKpiCards = ({ kpiData }) => [
  {
    name: "Budget",
    stat: kpiData.budget,
    rawValue: kpiData.budgetRaw,
    formatter: kpiData.currencyFmt,
    helper: kpiData.budgetHelper,
    icon: Briefcase,
  },
  {
    name: "Spent",
    stat: kpiData.spent,
    rawValue: kpiData.spentRaw,
    formatter: kpiData.currencyFmt,
    helper: kpiData.spentHelper,
    badge: kpiData.spentBadge,
    badgeRawValue: kpiData.budgetRaw > 0 ? kpiData.budgetUsagePercentage : null,
    badgeFormatter: (v) => `${Math.round(v)}%`,
    badgeType: kpiData.spentBadgeType,
    icon: CreditCard,
  },
  {
    name: "Remaining",
    stat: kpiData.remaining,
    rawValue: kpiData.remainingRaw,
    formatter: kpiData.currencyFmt,
    helper: kpiData.remainingHelper,
    badge: kpiData.remainingBadge,
    badgeType: kpiData.remainingBadgeType,
    icon: Target,
  },
];
