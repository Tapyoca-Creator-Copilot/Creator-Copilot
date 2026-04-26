import { Briefcase, CreditCard, Percent, Target } from "lucide-react";

export const buildDashboardKpiCards = ({ currencyFormatter, budgetAmount, spentAmount, remainingAmount, budgetUsedPercent, filteredExpenses, averageExpense }) => [
  {
    name: "Total Budget",
    stat: currencyFormatter(budgetAmount),
    icon: Briefcase,
    helper: "Project budget ceiling",
  },
  {
    name: "Total Spent",
    stat: currencyFormatter(spentAmount),
    icon: CreditCard,
    helper: `Across ${filteredExpenses.length} expenses`,
    badge: budgetAmount > 0 ? `${budgetUsedPercent.toFixed(0)}%` : "—",
    badgeType: budgetAmount > 0 && budgetUsedPercent > 90 ? "negative" : "positive",
  },
  {
    name: "Remaining Budget",
    stat: currencyFormatter(remainingAmount),
    icon: Target,
    helper: remainingAmount < 0 ? "Over budget" : "Available to allocate",
    badge: remainingAmount < 0 ? "Over budget" : "On track",
    badgeType: remainingAmount < 0 ? "negative" : "positive",
  },
  {
    name: "Budget Used",
    stat: `${budgetUsedPercent.toFixed(1)}%`,
    icon: Percent,
    helper: budgetAmount > 0 ? `${currencyFormatter(averageExpense)} avg per expense` : "Set a budget to enable ratio",
    badge: budgetAmount > 0 ? (budgetUsedPercent > 90 ? "High usage" : "Low usage") : "—",
    badgeType: budgetAmount > 0 && budgetUsedPercent > 90 ? "negative" : "positive",
  },
];

export const buildExpenseKpiCards = ({ kpiData }) => [
  {
    name: "Budget",
    stat: kpiData.budget,
    helper: kpiData.budgetHelper,
    icon: Briefcase,
  },
  {
    name: "Spent",
    stat: kpiData.spent,
    helper: kpiData.spentHelper,
    badge: kpiData.spentBadge,
    badgeType: kpiData.spentBadgeType,
    icon: CreditCard,
  },
  {
    name: "Remaining",
    stat: kpiData.remaining,
    helper: kpiData.remainingHelper,
    badge: kpiData.remainingBadge,
    badgeType: kpiData.remainingBadgeType,
    icon: Target,
  },
];