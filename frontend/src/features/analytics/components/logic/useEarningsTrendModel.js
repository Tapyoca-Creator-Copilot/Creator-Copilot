import {
  EARNING_COLOR,
  EARNING_FILL,
  getSingleBarChartSizing,
} from "@/features/analytics/components/config/chartConfig";
import SingleValueChartTooltip from "@/features/analytics/components/shared/SingleValueChartTooltip";
import {
  calculatePointChange,
  getEdgeXAxisTicks,
} from "@/features/analytics/components/calculations/trendMetrics";
import { createEdgeXAxisTickRenderer } from "@/features/analytics/components/logic/axisTicks";
import {
  cx,
  formatChange,
  getChangeColorClass,
  getInsightCopy,
} from "@/features/analytics/utils/areaChartInsights";
import { currencyFormatter } from "@/features/analytics/utils/formatters";
import { buildEarningTrendData, getTimeRangeLabel } from "@/features/analytics/utils/graphTimeRange";
import { createElement, useCallback, useMemo, useState } from "react";

const EARNING_INSIGHT_COPY = {
  pluralLabel: "Earnings",
  singularLabel: "earning",
  emptyBody:
    "There are no earning entries in the selected period yet. Once earnings are added, this section will summarize the trend direction and highlight momentum.",
  emptyAction: "Try switching to a longer range if you want to inspect a broader earning pattern.",
  upwardSummary: "Earnings are trending upward across the selected period, which may indicate stronger project income.",
  downwardSummary: "Earnings are easing across the selected period, which may indicate fewer or smaller incoming payments.",
  stableSummary: "Earnings are holding steady across the selected period, with no major shift in incoming money.",
  upwardTrend: "Earnings are trending upward across the period, suggesting income momentum is improving.",
  downwardTrend: "Earnings have eased over the period, which may indicate fewer or smaller earning entries.",
  stableTrend: "Earnings have remained relatively steady across the period, with no major shift in incoming money.",
  increasedTitle: "Earnings picked up",
  decreasedTitle: "Earnings decreased",
  positiveAction: "This is a good signal. Check which sources are driving the increase so you can repeat what is working.",
  moderatePositiveAction: "This looks like a moderate increase; check whether it aligns with expected earning activity.",
  negativeAction: "This drop may need attention. Review source timing and expected upcoming payments.",
  moderateNegativeAction: "This is a mild decline; keep monitoring upcoming earning entries to see whether the slower pace continues.",
  stableAction: "No immediate action is required, but continue monitoring upcoming earning entries.",
};

export const useEarningsTrendModel = ({
  projectId,
  earnings,
  timeRange,
  currency: projectCurrency,
  projectStartDate,
  projectEndDate,
}) => {
  const [tooltipState, setTooltipState] = useState(null);
  const useAreaChart = timeRange === "day";
  const barChartSizing = getSingleBarChartSizing(timeRange);

  const currency = useMemo(
    () => projectCurrency || earnings.find((e) => e?.project?.currency)?.project?.currency || "USD",
    [earnings, projectCurrency]
  );

  const tooltipKey = useMemo(
    () => `${projectId || "no-project"}:${timeRange}:earnings`,
    [projectId, timeRange]
  );
  const resolvedTooltipState = tooltipState?.key === tooltipKey ? tooltipState : null;

  const chartData = useMemo(
    () => buildEarningTrendData(earnings, timeRange, { projectStartDate, projectEndDate }),
    [earnings, timeRange, projectStartDate, projectEndDate]
  );

  const rangeTotal = useMemo(
    () => (earnings || []).reduce((sum, e) => sum + Number(e?.amount || 0), 0),
    [earnings]
  );

  const timeRangeLabel = getTimeRangeLabel(timeRange).toLowerCase();
  const payload = resolvedTooltipState?.payload?.[0];
  const value = payload?.payload?.[payload?.dataKey];
  const currentDate = payload?.payload?.date || chartData[chartData.length - 1]?.date || "--";
  const { percentageChange, absoluteChange } = useMemo(
    () => calculatePointChange({ chartData, payload, value }),
    [chartData, payload, value]
  );

  const formattedValue = payload
    ? currencyFormatter(value, currency)
    : currencyFormatter(rangeTotal, currency);
  const changeChipClassName = cx(
    "rounded-md px-2 py-1 text-sm font-medium",
    getChangeColorClass(payload, percentageChange)
  );
  const changeChipLabel = formatChange(payload, percentageChange, absoluteChange, currency);
  const insightCopy = getInsightCopy(
    chartData,
    payload,
    percentageChange,
    absoluteChange,
    timeRangeLabel,
    currency,
    EARNING_INSIGHT_COPY
  );
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

      const point = tooltipPayload?.[0];
      const tooltipDate = point?.payload?.date;
      const tooltipAmount = point?.value;
      if (!active || typeof tooltipAmount !== "number") return null;

      return createElement(SingleValueChartTooltip, {
        title: tooltipDate,
        value: currencyFormatter(tooltipAmount, currency),
        markerColor: EARNING_COLOR,
        markerLabel: "earnings",
      });
    },
    [currency, tooltipKey]
  );

  return {
    barChartSizing,
    chartData,
    changeChipClassName,
    changeChipLabel,
    colors: { fill: EARNING_FILL, stroke: EARNING_COLOR },
    currentDate,
    formattedValue,
    insightCopy,
    renderTooltipContent,
    renderXAxisTick,
    timeRangeLabel,
    useAreaChart,
    xAxisTicks,
  };
};
