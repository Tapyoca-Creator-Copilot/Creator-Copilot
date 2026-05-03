import { EXPENSE_DEPARTMENTS } from "@/features/expenses/services/expenses";
import { EARNING_SOURCE_TYPES } from "@/features/earnings/services/earnings";
import {
  AvailableChartColors,
  constructCategoryColors,
} from "@/lib/chartUtils";

export const DONUT_HEX_PALETTE = [
  "#C87343",
  "#1B6DAD",
  "#72993E",
  "#B04848",
  "#82246C",
  "#D8BA58",
];

const DONUT_COLOR_ORDER = [
  "primary",
  "blue",
  "violet",
  "green",
  "red",
  "fuchsia",
];

const resolveCategoryLabel = (expense) =>
  expense?.category?.trim() || expense?.department?.trim() || "Uncategorized";

const resolveDepartmentLabel = (expense) => {
  const department = expense?.department?.trim();
  if (!department) {
    return "Other";
  }

  return EXPENSE_DEPARTMENTS.includes(department) ? department : "Other";
};

const resolveEarningSourceLabel = (earning) => {
  const sourceType = earning?.sourceType?.trim();
  if (!sourceType) {
    return "Other";
  }

  return EARNING_SOURCE_TYPES.includes(sourceType) ? sourceType : "Other";
};

const buildDonutRows = (totalsMap) => {
  const sorted = Array.from(totalsMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const totalAmount = sorted.reduce((sum, item) => sum + item.amount, 0);
  const colorMap = constructCategoryColors(sorted.map((item) => item.name), DONUT_COLOR_ORDER);

  return {
    totalAmount,
    rows: sorted.map((item, index) => {
      const percentage = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
      const color = colorMap.get(item.name) || AvailableChartColors[0] || "gray";
      const colorHex = DONUT_HEX_PALETTE[index % DONUT_HEX_PALETTE.length];

      return {
        name: item.name,
        amount: Number(item.amount.toFixed(2)),
        share: `${percentage.toFixed(1)}%`,
        color,
        colorHex,
      };
    }),
  };
};

export const buildCategoryData = (expenses) => {
  const totalsByCategory = new Map();

  (expenses || []).forEach((expense) => {
    const label = resolveCategoryLabel(expense);
    const currentTotal = totalsByCategory.get(label) || 0;
    totalsByCategory.set(label, currentTotal + Number(expense?.amount || 0));
  });

  return buildDonutRows(totalsByCategory);
};

export const buildDepartmentData = (expenses) => {
  const totalsByDepartment = new Map();

  (expenses || []).forEach((expense) => {
    const label = resolveDepartmentLabel(expense);
    const currentTotal = totalsByDepartment.get(label) || 0;
    totalsByDepartment.set(label, currentTotal + Number(expense?.amount || 0));
  });

  return buildDonutRows(totalsByDepartment);
};

export const buildEarningSourceData = (earnings) => {
  const totalsBySource = new Map();

  (earnings || []).forEach((earning) => {
    const label = resolveEarningSourceLabel(earning);
    const currentTotal = totalsBySource.get(label) || 0;
    totalsBySource.set(label, currentTotal + Number(earning?.amount || 0));
  });

  return buildDonutRows(totalsBySource);
};
