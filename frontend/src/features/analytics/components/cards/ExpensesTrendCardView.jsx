import { Card, CardContent } from "@/components/ui/card";
import {
  EXPENSE_COLOR,
  EXPENSE_FILL,
  getSingleBarChartSizing,
} from "@/features/analytics/components/config/chartConfig";
import ChartState from "@/features/analytics/components/shared/ChartState";
import InsightTitle from "@/features/analytics/components/shared/InsightTitle";
import {
  SingleSeriesTrendAreaChart,
  SingleSeriesTrendBarChart,
} from "@/features/analytics/components/charts/BarTrendCharts";
import { GRAPH_TIME_RANGE_OPTIONS } from "@/features/analytics/utils/graphTimeRange";
import { cn } from "@/lib/utils";

const AREA_CHART_VARIANTS = {
  expense: {
    stroke: EXPENSE_COLOR,
    fill: EXPENSE_FILL,
  },
};

const ExpensesTrendCardView = ({
  isLoading = false,
  projectId,
  currentDate,
  chartData,
  chartState,
  changeChipClassName,
  changeChipLabel,
  formattedValue,
  insightCopy,
  onTimeRangeChange,
  renderTooltipContent,
  renderXAxisTick,
  showTimeRangeFilter = true,
  timeRange,
  timeRangeLabel,
  xAxisTicks,
  chartVariant = "expense",
}) => {
  const chartColors = AREA_CHART_VARIANTS[chartVariant] || AREA_CHART_VARIANTS.expense;
  const useAreaChart = timeRange === "day";
  const barChartSizing = getSingleBarChartSizing(timeRange);
  const header = (
    <div className="mb-2 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold tracking-tight text-foreground">Expenses by {timeRangeLabel}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight" style={{ color: chartColors.stroke }}>
          {formattedValue}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">On {currentDate}</p>
      </div>

      {showTimeRangeFilter ? (
        <div className="shrink-0 inline-flex rounded-lg border border-border/70 bg-card p-1">
          {GRAPH_TIME_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onTimeRangeChange?.(option.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition sm:px-3 sm:py-1.5 sm:text-sm",
                timeRange === option.value
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );

  if (!projectId) {
    return (
      <Card className="h-full border-black/5 dark:border-white/10 bg-card">
        <CardContent className="h-full flex flex-col">
          {header}
          <ChartState
            className="mt-6"
            title={`Select a project to view ${timeRangeLabel} expense trend.`}
            description="Choose a project from the header selector to load the trend chart."
          />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full border-black/5 dark:border-white/10 bg-card">
        <CardContent className="h-full flex flex-col">
          {header}
          <ChartState className="mt-6" title="Loading expense chart..." description="" />
        </CardContent>
      </Card>
    );
  }

  if (!chartState.shouldRenderChart) {
    return (
      <Card className="h-full border-black/5 dark:border-white/10 bg-card">
        <CardContent className="h-full flex flex-col">
          {header}
          <ChartState
            className="mt-6"
            title={chartState.emptyState?.title}
            description={chartState.emptyState?.description}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-black/5 dark:border-white/10 bg-card">
      <CardContent className="h-full flex flex-col">
        <div className="flex min-h-0 flex-1 flex-col">
          {header}
          <div className="mt-2 flex justify-end">
            <span className={changeChipClassName}>{changeChipLabel}</span>
          </div>

          <div className="-mb-2 mt-6 min-h-60 flex-1 w-full">
            {useAreaChart ? (
              <SingleSeriesTrendAreaChart
                data={chartData}
                fill={chartColors.fill}
                stroke={chartColors.stroke}
                renderTooltipContent={renderTooltipContent}
                renderXAxisTick={renderXAxisTick}
                xAxisTicks={xAxisTicks}
              />
            ) : (
              <SingleSeriesTrendBarChart
                data={chartData}
                fill={chartColors.stroke}
                barCategoryGap={barChartSizing.barCategoryGap}
                maxBarSize={barChartSizing.maxBarSize}
                cursorOpacity={barChartSizing.cursorOpacity}
                renderTooltipContent={renderTooltipContent}
                renderXAxisTick={renderXAxisTick}
                xAxisTicks={xAxisTicks}
              />
            )}
          </div>
        </div>

        <div className="pt-6">
          <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
            <p className="flex items-center gap-2 text-sm font-medium" style={{ color: chartColors.stroke }}>
              <InsightTitle direction={insightCopy.direction}>{insightCopy.title}</InsightTitle>
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground/90">{insightCopy.body}</p>
            {insightCopy.action ? (
              <p className="mt-3 text-sm font-medium leading-6 text-foreground">{insightCopy.action}</p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpensesTrendCardView;
