import { currencyFormatter } from "@/features/analytics/utils/formatters";

export const buildKpiData = (project, expenses) => {
  if (!project) {
    return {
      budget: "$0",
      budgetHelper: "Project budget ceiling",
      spent: "$0",
      spentBadge: "0%",
      spentBadgeType: "positive",
      spentHelper: "No expenses yet",
      remaining: "$0",
      remainingBadge: "On track",
      remainingBadgeType: "positive",
      remainingHelper: "Available to allocate",
      isOverBudget: false,
      budgetUsagePercentage: 0,
    };
  }

  const budgetAmount = Number(project.budgetCeiling || 0);
  const totalSpent = (expenses || []).reduce((sum, expense) => sum + Number(expense?.amount || 0), 0);
  const remaining = budgetAmount - totalSpent;
  const budgetUsagePercentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;
  const isOverBudget = remaining < 0;
  const avgExpense = expenses?.length > 0 ? totalSpent / expenses.length : 0;

  return {
    budget: currencyFormatter(budgetAmount),
    budgetHelper: "Project budget ceiling",
    spent: currencyFormatter(totalSpent),
    spentBadge: budgetAmount > 0 ? `${budgetUsagePercentage.toFixed(0)}%` : "—",
    spentBadgeType: budgetUsagePercentage > 90 ? "negative" : "positive",
    spentHelper: `Across ${expenses?.length || 0} expenses`,
    remaining: currencyFormatter(remaining),
    remainingBadge: isOverBudget ? "Over budget" : "On track",
    remainingBadgeType: isOverBudget ? "negative" : "positive",
    remainingHelper: isOverBudget ? "Over budget" : "Available to allocate",
    isOverBudget,
    budgetUsagePercentage,
    avgExpense,
  };
};
