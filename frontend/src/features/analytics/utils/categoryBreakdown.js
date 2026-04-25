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

export const buildCategoryData = (expenses) => {
  const totalsByCategory = new Map();

  (expenses || []).forEach((expense) => {
    const label = resolveCategoryLabel(expense);
    const currentTotal = totalsByCategory.get(label) || 0;
    totalsByCategory.set(label, currentTotal + Number(expense?.amount || 0));
  });

  const sorted = Array.from(totalsByCategory.entries())
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
