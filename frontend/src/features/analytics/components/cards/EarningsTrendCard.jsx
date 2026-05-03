import { Card, CardContent } from "@/components/ui/card";
import ChartState from "@/features/analytics/components/shared/ChartState";
import {
  SingleSeriesTrendAreaChart,
  SingleSeriesTrendBarChart,
} from "@/features/analytics/components/charts/BarTrendCharts";
import { useEarningsTrendModel } from "@/features/analytics/components/logic/useEarningsTrendModel";
import InsightTitle from "@/features/analytics/components/shared/InsightTitle";

const EarningsTrendCard = ({
  projectId,
  earnings = [],
  isLoading = false,
  timeRange = "month",
  currency: projectCurrency,
  projectStartDate,
  projectEndDate,
}) => {
  const chart = useEarningsTrendModel({
    projectId,
    earnings,
    timeRange,
    currency: projectCurrency,
    projectStartDate,
    projectEndDate,
  });

  const header = (
    <div className="mb-2">
      <p className="text-lg font-semibold tracking-tight text-foreground">
        Earnings by {chart.timeRangeLabel}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-area-chart-earning-stroke">
        {chart.formattedValue}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">On {chart.currentDate}</p>
    </div>
  );

  const renderState = (title, description = "") => (
    <Card className="h-full border-black/5 dark:border-white/10 bg-card">
      <CardContent className="h-full flex flex-col">
        {header}
        <ChartState className="mt-6" title={title} description={description} />
      </CardContent>
    </Card>
  );

  if (!projectId) return renderState("Select a project to view earnings trend.");
  if (isLoading) return renderState("Loading earnings chart...");
  if (chart.chartData.length < 2) {
    return renderState(
      "Not enough data to render a trend yet.",
      "Add more earnings with dates to see the earnings chart."
    );
  }

  return (
    <Card className="h-full border-black/5 dark:border-white/10 bg-card">
      <CardContent className="h-full flex flex-col">
        <div className="flex min-h-0 flex-1 flex-col">
          {header}
          <div className="mt-2 flex justify-end">
            <span className={chart.changeChipClassName}>{chart.changeChipLabel}</span>
          </div>

          <div className="-mb-2 mt-6 min-h-60 flex-1 w-full">
            {chart.useAreaChart ? (
              <SingleSeriesTrendAreaChart
                data={chart.chartData}
                fill={chart.colors.fill}
                stroke={chart.colors.stroke}
                renderTooltipContent={chart.renderTooltipContent}
                renderXAxisTick={chart.renderXAxisTick}
                xAxisTicks={chart.xAxisTicks}
              />
            ) : (
              <SingleSeriesTrendBarChart
                data={chart.chartData}
                fill={chart.colors.stroke}
                barCategoryGap={chart.barChartSizing.barCategoryGap}
                maxBarSize={chart.barChartSizing.maxBarSize}
                cursorOpacity={chart.barChartSizing.cursorOpacity}
                renderTooltipContent={chart.renderTooltipContent}
                renderXAxisTick={chart.renderXAxisTick}
                xAxisTicks={chart.xAxisTicks}
              />
            )}
          </div>
        </div>

        <div className="pt-6">
          <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
            <p className="flex items-center gap-2 text-sm font-medium" style={{ color: chart.colors.stroke }}>
              <InsightTitle direction={chart.insightCopy.direction}>
                {chart.insightCopy.title}
              </InsightTitle>
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground/90">{chart.insightCopy.body}</p>
            {chart.insightCopy.action ? (
              <p className="mt-3 text-sm font-medium leading-6 text-foreground">
                {chart.insightCopy.action}
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EarningsTrendCard;
