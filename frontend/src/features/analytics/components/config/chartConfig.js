export const EARNING_COLOR = "var(--area-chart-earning-stroke)";
export const EARNING_FILL = "var(--area-chart-earning-fill)";
export const EXPENSE_COLOR = "var(--area-chart-expense-stroke)";
export const EXPENSE_FILL = "var(--area-chart-expense-fill)";

export const SINGLE_BAR_CHART_SIZING_BY_RANGE = {
  week: {
    barCategoryGap: "10%",
    maxBarSize: null,
    cursorOpacity: 0.1,
  },
  month: {
    barCategoryGap: "10%",
    maxBarSize: null,
    cursorOpacity: 0.16,
  },
};

export const getSingleBarChartSizing = (timeRange) =>
  SINGLE_BAR_CHART_SIZING_BY_RANGE[timeRange] || SINGLE_BAR_CHART_SIZING_BY_RANGE.month;
