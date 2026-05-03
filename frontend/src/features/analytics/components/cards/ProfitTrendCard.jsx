import { Card, CardContent } from "@/components/ui/card";
import {
  ComparisonTrendAreaChart,
  ComparisonTrendBarChart,
} from "@/features/analytics/components/charts/BarTrendCharts";
import { useProfitTrendModel } from "@/features/analytics/components/logic/useProfitTrendModel";
import ChartState from "@/features/analytics/components/shared/ChartState";
import InsightTitle from "@/features/analytics/components/shared/InsightTitle";

const ProfitLegend = ({ colors }) => (
  <div className="flex gap-4 text-xs text-muted-foreground">
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.earningStroke }} />
      Earnings
    </div>
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.expenseStroke }} />
      Expenses
    </div>
  </div>
);

const ProfitTrendCard = ({
  projectId,
  earnings = [],
  expenses = [],
  isLoading = false,
  timeRange = "month",
  currency: projectCurrency,
  projectStartDate,
  projectEndDate,
}) => {
  const chart = useProfitTrendModel({
    projectId,
    earnings,
    expenses,
    timeRange,
    currency: projectCurrency,
    projectStartDate,
    projectEndDate,
  });

  const header = (
    <div className="mb-2">
      <p className="text-lg font-semibold tracking-tight text-foreground">
        Earnings vs. Expenses by {chart.timeRangeLabel}
      </p>
      <p
        className="mt-2 text-2xl font-semibold tracking-tight"
        style={{ color: chart.profitPositive ? chart.colors.earningStroke : chart.colors.expenseStroke }}
      >
        {chart.formattedProfit}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        On {chart.currentDate} · {chart.displayedProfit >= 0 ? "above break-even" : "below break-even"}
      </p>
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

  if (!projectId) {
    return renderState(
      "Select a project to view the profit trend.",
      "Choose a project from the header selector to load the chart."
    );
  }
  if (isLoading) return renderState("Loading profit chart...");
  if (chart.chartData.length < 2) {
    return renderState(
      "Not enough data points to render a trend yet.",
      "Add earnings and expenses with dates to generate the profit chart."
    );
  }

  return (
    <Card className="h-full border-black/5 dark:border-white/10 bg-card">
      <CardContent className="h-full flex flex-col">
        <div>
          {header}
          <div className="mt-2 flex justify-end">
            <span className={chart.changeChipClassName}>{chart.changeChipLabel}</span>
          </div>

          <div className="-mb-2 mt-6 h-60 w-full">
            {chart.useAreaChart ? (
              <ComparisonTrendAreaChart
                data={chart.chartData}
                firstFill={chart.colors.earningFill}
                firstStroke={chart.colors.earningStroke}
                secondFill={chart.colors.expenseFill}
                secondStroke={chart.colors.expenseStroke}
                renderTooltipContent={chart.renderTooltipContent}
                renderXAxisTick={chart.renderXAxisTick}
                xAxisTicks={chart.xAxisTicks}
              />
            ) : (
              <ComparisonTrendBarChart
                data={chart.chartData}
                firstFill={chart.colors.earningStroke}
                secondFill={chart.colors.expenseStroke}
                renderTooltipContent={chart.renderTooltipContent}
                renderXAxisTick={chart.renderXAxisTick}
                xAxisTicks={chart.xAxisTicks}
              />
            )}
          </div>
        </div>

        <div className="mt-auto pt-6">
          <div className="mb-4 rounded-lg border border-border/70 bg-muted/30 p-4">
            <p
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: chart.profitPositive ? chart.colors.earningStroke : chart.colors.expenseStroke }}
            >
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
          <ProfitLegend colors={chart.colors} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitTrendCard;
