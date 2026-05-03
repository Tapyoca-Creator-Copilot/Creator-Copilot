import { currencyFormatter } from "@/features/analytics/utils/formatters";

export const buildEarningKpiData = (earnings, project, expenses = []) => {
  const currency = project?.currency || "USD";
  const currencyFmt = (v) => currencyFormatter(v, currency);
  const count = (earnings || []).length;
  const totalEarned = (earnings || []).reduce((sum, e) => sum + Number(e?.amount || 0), 0);
  const totalSpent = (expenses || []).reduce((sum, e) => sum + Number(e?.amount || 0), 0);
  const profit = totalEarned - totalSpent;
  const avgEarning = count > 0 ? totalEarned / count : 0;

  return {
    totalEarned: currencyFmt(totalEarned),
    totalEarnedRaw: totalEarned,
    totalEarnedHelper: `Across ${count} earning${count !== 1 ? "s" : ""}`,
    totalEarnedBadge: totalEarned > 0 ? "Earning" : "No earnings",
    totalEarnedBadgeType: totalEarned > 0 ? "positive" : "negative",
    count,
    profit: currencyFmt(profit),
    profitRaw: profit,
    profitHelper: profit >= 0 ? "Above break-even" : "Below break-even",
    profitBadge: profit >= 0 ? "Profitable" : "In the red",
    profitBadgeType: profit >= 0 ? "positive" : "negative",
    avgEarning: currencyFmt(avgEarning),
    avgEarningRaw: avgEarning,
    avgEarningHelper: "Per earning logged",
    avgEarningBadge: count > 0 ? "Avg active" : "No average",
    avgEarningBadgeType: count > 0 ? "positive" : "negative",
    currencyFmt,
  };
};

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
  const currency = project?.currency || "USD";
  const totalSpent = (expenses || []).reduce((sum, expense) => sum + Number(expense?.amount || 0), 0);
  const remaining = budgetAmount - totalSpent;
  const budgetUsagePercentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;
  const isOverBudget = remaining < 0;
  const avgExpense = expenses?.length > 0 ? totalSpent / expenses.length : 0;

  const currencyFmt = (v) => currencyFormatter(v, currency);

  return {
    budget: currencyFormatter(budgetAmount, currency),
    budgetRaw: budgetAmount,
    budgetHelper: "Project budget ceiling",
    spent: currencyFormatter(totalSpent, currency),
    spentRaw: totalSpent,
    spentBadge: budgetAmount > 0 ? `${budgetUsagePercentage.toFixed(0)}%` : "—",
    spentBadgeType: budgetUsagePercentage > 90 ? "negative" : "positive",
    spentHelper: `Across ${expenses?.length || 0} expenses`,
    remaining: currencyFormatter(remaining, currency),
    remainingRaw: remaining,
    remainingBadge: isOverBudget ? "Over budget" : "On track",
    remainingBadgeType: isOverBudget ? "negative" : "positive",
    remainingHelper: isOverBudget ? "Over budget" : "Available to allocate",
    isOverBudget,
    budgetUsagePercentage,
    avgExpense,
    currencyFmt,
  };
};
