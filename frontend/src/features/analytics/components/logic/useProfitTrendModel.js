import {
  EARNING_COLOR,
  EARNING_FILL,
  EXPENSE_COLOR,
  EXPENSE_FILL,
} from "@/features/analytics/components/config/chartConfig";
import { buildProfitInsightCopy } from "@/features/analytics/components/calculations/profitInsights";
import {
  calculateProfitChange,
  getEdgeXAxisTicks,
} from "@/features/analytics/components/calculations/trendMetrics";
import { createEdgeXAxisTickRenderer } from "@/features/analytics/components/logic/axisTicks";
import ProfitTooltip from "@/features/analytics/components/shared/ProfitTooltip";
import {
  cx,
  formatChange,
  getChangeColorClass,
} from "@/features/analytics/utils/areaChartInsights";
import { currencyFormatter } from "@/features/analytics/utils/formatters";
import { buildProfitTrendData, getTimeRangeLabel } from "@/features/analytics/utils/graphTimeRange";
import { createElement, useCallback, useMemo, useState } from "react";

export const useProfitTrendModel = ({
  projectId,
  earnings,
  expenses,
  timeRange,
  currency: projectCurrency,
  projectStartDate,
  projectEndDate,
}) => {
  const [tooltipState, setTooltipState] = useState(null);
  const useAreaChart = timeRange === "day";

  const currency = useMemo(
    () =>
      projectCurrency ||
      expenses.find((e) => e?.project?.currency)?.project?.currency ||
      earnings.find((e) => e?.project?.currency)?.project?.currency ||
      "USD",
    [expenses, earnings, projectCurrency]
  );

  const chartData = useMemo(
    () => buildProfitTrendData(earnings, expenses, timeRange, { projectStartDate, projectEndDate }),
    [earnings, expenses, timeRange, projectStartDate, projectEndDate]
  );

  const tooltipKey = useMemo(
    () => `${projectId || "no-project"}:${timeRange}:profit`,
    [projectId, timeRange]
  );
  const resolvedTooltipState = tooltipState?.key === tooltipKey ? tooltipState : null;
  const totalProfit = useMemo(
    () => chartData.reduce((sum, b) => sum + (b.profit || 0), 0),
    [chartData]
  );
  const profitPositive = totalProfit >= 0;
  const timeRangeLabel = getTimeRangeLabel(timeRange).toLowerCase();
  const activePoint = resolvedTooltipState?.payload?.[0]?.payload || null;
  const currentDate = activePoint?.date || chartData[chartData.length - 1]?.date || "--";
  const displayedProfit = activePoint ? Number(activePoint.profit || 0) : totalProfit;

  const { percentageChange, absoluteChange } = useMemo(
    () => calculateProfitChange({ chartData, activePoint }),
    [activePoint, chartData]
  );

  const activePayload = activePoint ? { payload: activePoint } : null;
  const changeChipClassName = cx(
    "rounded-md px-2 py-1 text-sm font-medium",
    getChangeColorClass(activePayload, percentageChange)
  );
  const changeChipLabel = formatChange(activePayload, percentageChange, absoluteChange, currency);
  const insightCopy = buildProfitInsightCopy({
    chartData,
    activePoint,
    percentageChange,
    absoluteChange,
    currency,
  });
  const xAxisTicks = useMemo(() => getEdgeXAxisTicks(chartData), [chartData]);
  const renderXAxisTick = useMemo(() => createEdgeXAxisTickRenderer(xAxisTicks), [xAxisTicks]);

  const renderTooltipContent = useCallback(
    ({ active, payload: tooltipPayload, label }) => {
      if (active) {
        setTooltipState((previous) => {
          if (previous?.key === tooltipKey && previous?.label === label) return previous;
          return { key: tooltipKey, payload: tooltipPayload, label };
        });
      } else {
        setTooltipState(null);
      }

      if (!active || !tooltipPayload?.length) return null;

      const earningVal = tooltipPayload.find((p) => p.dataKey === "earnings")?.value ?? 0;
      const expenseVal = tooltipPayload.find((p) => p.dataKey === "expenses")?.value ?? 0;

      return createElement(ProfitTooltip, {
        label,
        earnings: earningVal,
        expenses: expenseVal,
        currency,
      });
    },
    [currency, tooltipKey]
  );

  return {
    chartData,
    changeChipClassName,
    changeChipLabel,
    colors: {
      earningFill: EARNING_FILL,
      earningStroke: EARNING_COLOR,
      expenseFill: EXPENSE_FILL,
      expenseStroke: EXPENSE_COLOR,
    },
    currentDate,
    displayedProfit,
    formattedProfit: currencyFormatter(displayedProfit, currency),
    insightCopy,
    profitPositive,
    renderTooltipContent,
    renderXAxisTick,
    timeRangeLabel,
    useAreaChart,
    xAxisTicks,
  };
};
