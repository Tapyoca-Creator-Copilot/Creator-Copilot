import { Card, CardContent } from "@/components/ui/card";
import { filterExpensesByTimeRange, getTimeRangeLabel } from "@/features/analytics/utils/graphTimeRange";
import { buildKpiData } from "@/features/analytics/utils/kpiMetrics";
import { useMemo } from "react";
import { KPICard } from "./KPICard";
import { buildExpenseKpiCards } from "./kpiCardPresets";

export function KPICardsSection({
  projectId,
  project,
  expenses = [],
  isLoading = false,
  error = null,
  timeRange = "month",
  projectStartDate,
  projectEndDate,
}) {
  const filteredExpenses = useMemo(
    () => filterExpensesByTimeRange(expenses, timeRange, { projectStartDate, projectEndDate }),
    [expenses, projectEndDate, projectStartDate, timeRange]
  );

  const kpiData = useMemo(() => buildKpiData(project, filteredExpenses), [filteredExpenses, project]);
  const expenseKpiCards = useMemo(() => buildExpenseKpiCards({ kpiData }), [kpiData]);
  const timeRangeLabel = getTimeRangeLabel(timeRange).toLowerCase();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-black/5 bg-card md:col-span-2 lg:col-span-3 dark:border-white/10">
          <CardContent className="pt-6 text-sm text-muted-foreground">Loading KPI cards...</CardContent>
        </Card>
      </div>
    );
  }

  if (error || !project) {
    if (!projectId) {
      return (
        <div className="rounded-lg border border-border/70 bg-card p-4 text-sm text-muted-foreground">
          Select a project to view {timeRangeLabel} Budget, Spent, and Remaining KPIs.
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200">
        <p className="text-sm font-medium">{error || "Failed to load project data"}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {expenseKpiCards.map((card) => (
        <KPICard key={card.name} {...card} />
      ))}
    </div>
  );
}
