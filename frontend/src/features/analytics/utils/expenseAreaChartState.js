const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getProjectDurationInDays = (projectStartDate, projectEndDate) => {
  const start = parseDate(projectStartDate);
  const end = parseDate(projectEndDate);

  if (!start || !end) {
    return null;
  }

  const normalizedStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  const diffInMilliseconds = Math.abs(normalizedEnd.getTime() - normalizedStart.getTime());
  return Math.floor(diffInMilliseconds / MILLISECONDS_IN_DAY) + 1;
};

export const resolveExpenseAreaChartState = ({
  timeRange,
  chartData,
  filteredExpenses,
  projectStartDate,
  projectEndDate,
}) => {
  const groupedPointCount = (chartData || []).length;
  const hasMeaningfulTrend = groupedPointCount >= 2;

  const projectDurationInDays = getProjectDurationInDays(projectStartDate, projectEndDate);
  const hasProjectBounds = projectDurationInDays !== null;
  const isShortTermProject = hasProjectBounds && projectDurationInDays < 32;

  const isShortProjectMonthlyRange =
    timeRange === "month" && isShortTermProject && groupedPointCount < 2;

  if (isShortProjectMonthlyRange) {
    return {
      status: "insufficient_range",
      shouldRenderChart: false,
      shouldRenderInsight: false,
      emptyState: {
        title: "No expense data available for this range.",
        description: "Due to this being a short term project we cannot render area chart based on months.",
      },
    };
  }

  if (!hasMeaningfulTrend) {
    return {
      status: "sparse",
      shouldRenderChart: false,
      shouldRenderInsight: false,
      emptyState: {
        title: "Not enough data points to render a trend yet.",
        description:
          "Switch to a shorter time view or add more dated expenses to generate a meaningful area trend.",
      },
    };
  }

  if (!(filteredExpenses || []).length) {
    return {
      status: "empty",
      shouldRenderChart: false,
      shouldRenderInsight: false,
      emptyState: {
        title: "No expenses recorded in this range.",
        description: "Add expenses in the selected project and time view to render a trend.",
      },
    };
  }

  return {
    status: "valid_trend",
    shouldRenderChart: true,
    shouldRenderInsight: true,
    emptyState: null,
  };
};
