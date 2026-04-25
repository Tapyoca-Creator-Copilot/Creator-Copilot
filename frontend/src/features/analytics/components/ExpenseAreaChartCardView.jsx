import { Card, CardContent } from "@/components/ui/card";
import ChartStateMessage from "@/features/analytics/components/chart-state/ChartStateMessage";
import { GRAPH_TIME_RANGE_OPTIONS } from "@/features/analytics/utils/graphTimeRange";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { Area, AreaChart as RechartsAreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const ExpenseAreaChartCardView = ({
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
}) => {
  const header = (
    <div className="mb-2 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold tracking-tight text-foreground">Expenses by {timeRangeLabel}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{formattedValue}</p>
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
          <ChartStateMessage
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
          <ChartStateMessage className="mt-6" title="Loading expense chart..." description="" />
        </CardContent>
      </Card>
    );
  }

  if (!chartState.shouldRenderChart) {
    return (
      <Card className="h-full border-black/5 dark:border-white/10 bg-card">
        <CardContent className="h-full flex flex-col">
          {header}
          <ChartStateMessage
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
        <div>
          {header}
          <div className="mt-2 flex justify-end">
            <span className={changeChipClassName}>{changeChipLabel}</span>
          </div>

          <div className="-mb-2 mt-6 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsAreaChart data={chartData} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="expenseTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="date"
                  ticks={xAxisTicks}
                  interval={0}
                  allowDuplicatedCategory={false}
                  padding={{ left: 0, right: 0 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={0}
                  tick={renderXAxisTick}
                />

                <Tooltip
                  wrapperStyle={{ outline: "none" }}
                  isAnimationActive={false}
                  cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
                  content={renderTooltipContent}
                />

                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#expenseTrendFill)"
                  isAnimationActive={true}
                  animationDuration={700}
                  activeDot={{ r: 5, fill: "var(--primary)", stroke: "var(--primary)" }}
                />
              </RechartsAreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-primary dark:text-primary">
              <ArrowUpRight className="h-4 w-4" />
              {insightCopy.title}
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

export default ExpenseAreaChartCardView;