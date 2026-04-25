import ExpenseAreaChartCardView from "@/features/analytics/components/ExpenseAreaChartCardView";
import useExpenseAreaChartCard from "@/features/analytics/hooks/useExpenseAreaChartCard";

const ExpenseAreaChartCard = ({
  projectId,
  expenses = [],
  isLoading = false,
  timeRange = "month",
  onTimeRangeChange,
  projectStartDate,
  projectEndDate,
  showTimeRangeFilter = true,
}) => {
  const chartModel = useExpenseAreaChartCard({
    projectId,
    expenses,
    timeRange,
    projectStartDate,
    projectEndDate,
  });

  return (
    <ExpenseAreaChartCardView
      isLoading={isLoading}
      projectId={projectId}
      chartData={chartModel.chartData}
      chartState={chartModel.chartState}
      changeChipClassName={chartModel.changeChipClassName}
      changeChipLabel={chartModel.changeChipLabel}
      currentDate={chartModel.currentDate}
      formattedValue={chartModel.formattedValue}
      insightCopy={chartModel.insightCopy}
      onTimeRangeChange={onTimeRangeChange}
      renderTooltipContent={chartModel.renderTooltipContent}
      renderXAxisTick={chartModel.renderXAxisTick}
      showTimeRangeFilter={showTimeRangeFilter}
      timeRange={timeRange}
      timeRangeLabel={chartModel.timeRangeLabel}
      xAxisTicks={chartModel.xAxisTicks}
    />
  );
};

export default ExpenseAreaChartCard;
