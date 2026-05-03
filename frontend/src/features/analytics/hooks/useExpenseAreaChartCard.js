import SingleValueChartTooltip from "@/features/analytics/components/shared/SingleValueChartTooltip";
import {
  cx,
  formatChange,
  getChangeColorClass,
  getInsightCopy,
} from "@/features/analytics/utils/areaChartInsights";
import { resolveExpenseAreaChartState } from "@/features/analytics/utils/expenseAreaChartState";
import { currencyFormatter } from "@/features/analytics/utils/formatters";
import {
  buildExpenseTrendData,
  filterExpensesByTimeRange,
  getTimeRangeLabel,
} from "@/features/analytics/utils/graphTimeRange";
import { createElement, useCallback, useMemo, useState } from "react";

const useExpenseAreaChartCard = ({
  projectId,
  expenses = [],
  timeRange = "month",
  currency: projectCurrency,
  projectStartDate,
  projectEndDate,
}) => {
  const [tooltipState, setTooltipState] = useState(null);

  const currency = useMemo(
    () => projectCurrency || expenses.find((expense) => expense?.project?.currency)?.project?.currency || "USD",
    [expenses, projectCurrency]
  );

  const tooltipKey = useMemo(
    () => `${projectId || "no-project"}:${timeRange}`,
    [projectId, timeRange]
  );

  const resolvedTooltipState = tooltipState?.key === tooltipKey ? tooltipState : null;

  const filteredExpenses = useMemo(
    () => filterExpensesByTimeRange(expenses, timeRange, { projectStartDate, projectEndDate }),
    [expenses, projectEndDate, projectStartDate, timeRange]
  );

  const chartData = useMemo(
    () =>
      buildExpenseTrendData(filteredExpenses, timeRange, {
        projectStartDate,
        projectEndDate,
      }),
    [filteredExpenses, projectEndDate, projectStartDate, timeRange]
  );

  const rangeTotal = useMemo(
    () => filteredExpenses.reduce((sum, expense) => sum + Number(expense?.amount || 0), 0),
    [filteredExpenses]
  );

  const payload = resolvedTooltipState?.payload?.[0];
  const value = payload?.payload?.[payload?.dataKey];
  const currentDate = payload?.payload?.date || chartData[chartData.length - 1]?.date || "--";

  const { percentageChange, absoluteChange } = useMemo(() => {
    if (!payload || !payload?.dataKey || typeof value !== "number") {
      return { percentageChange: Number.NaN, absoluteChange: Number.NaN };
    }

    const previousIndex = chartData.findIndex((item) => item.date === payload?.payload?.date);
    const previousValues = previousIndex > 0 ? chartData[previousIndex - 1] : {};
    const previousValue = previousValues?.[payload.dataKey];

    if (typeof previousValue !== "number" || previousValue === 0) {
      return { percentageChange: Number.NaN, absoluteChange: Number.NaN };
    }

    return {
      percentageChange: ((value - previousValue) / previousValue) * 100,
      absoluteChange: value - previousValue,
    };
  }, [chartData, payload, value]);

  const formattedValue = payload
    ? currencyFormatter(value, currency)
    : currencyFormatter(rangeTotal, currency);
  const timeRangeLabel = getTimeRangeLabel(timeRange).toLowerCase();
  const insightCopy = getInsightCopy(
    chartData,
    payload,
    percentageChange,
    absoluteChange,
    timeRangeLabel,
    currency
  );

  const xAxisTicks = useMemo(() => {
    if (!chartData.length) {
      return [];
    }

    const firstRenderedLabel = chartData[0]?.date;
    const lastRenderedLabel = chartData[chartData.length - 1]?.date;

    if (!firstRenderedLabel) {
      return [];
    }

    if (!lastRenderedLabel || firstRenderedLabel === lastRenderedLabel) {
      return [firstRenderedLabel];
    }

    return [firstRenderedLabel, lastRenderedLabel];
  }, [chartData]);

  const renderXAxisTick = useCallback(
    ({ x, y, payload: tickPayload }) => {
      const label = tickPayload?.value;
      const firstLabel = xAxisTicks[0];
      const lastLabel = xAxisTicks[xAxisTicks.length - 1];

      let textAnchor = "middle";
      if (xAxisTicks.length > 1) {
        if (label === firstLabel) {
          textAnchor = "start";
        } else if (label === lastLabel) {
          textAnchor = "end";
        }
      }

      return createElement(
        "text",
        {
          x,
          y: y + 14,
          textAnchor,
          className: "fill-muted-foreground text-tremor-label text-sm",
        },
        label
      );
    },
    [xAxisTicks]
  );

  const chartState = useMemo(
    () =>
      resolveExpenseAreaChartState({
        timeRange,
        chartData,
        filteredExpenses,
        projectStartDate,
        projectEndDate,
      }),
    [chartData, filteredExpenses, projectEndDate, projectStartDate, timeRange]
  );

  const changeChipClassName = cx(
    "rounded-md px-2 py-1 text-sm font-medium",
    getChangeColorClass(payload, percentageChange)
  );
  const changeChipLabel = formatChange(payload, percentageChange, absoluteChange, currency);

  const renderTooltipContent = useCallback(
    ({ active, payload: tooltipPayload, label }) => {
      if (active) {
        setTooltipState((previous) => {
          if (previous?.key === tooltipKey && previous?.label === label) {
            return previous;
          }

          return { key: tooltipKey, payload: tooltipPayload, label };
        });
      } else {
        setTooltipState(null);
      }

      const point = tooltipPayload?.[0];
      const tooltipDate = point?.payload?.date;
      const tooltipAmount = point?.value;

      if (!active || typeof tooltipAmount !== "number") {
        return null;
      }

      return createElement(SingleValueChartTooltip, {
        title: tooltipDate,
        value: currencyFormatter(tooltipAmount, currency),
        markerColor: "var(--area-chart-expense-stroke)",
        markerLabel: "expenses",
      });
    },
    [currency, tooltipKey]
  );

  return {
    chartData,
    chartState,
    changeChipClassName,
    changeChipLabel,
    currentDate,
    formattedValue,
    insightCopy,
    renderTooltipContent,
    renderXAxisTick,
    timeRangeLabel,
    xAxisTicks,
  };
};

export default useExpenseAreaChartCard;
