import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { filterExpensesByTimeRange } from "@/features/analytics/utils/graphTimeRange";
import { buildKpiData } from "@/features/analytics/utils/kpiMetrics";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { buildExpenseKpiCards } from "./presets";

const EXPENSE_KPI_GRID_CLASS = "grid grid-cols-1 gap-4 sm:grid-cols-3";

const ResponsiveExpenseKpiCard = ({
  name,
  stat,
  helper,
  icon: Icon,
  badge,
  badgeType = "neutral",
}) => {
  const BadgeIcon = badgeType === "negative" ? TrendingDown : TrendingUp;

  return (
    <Card variant="kpi" className="min-w-0 overflow-hidden px-4 py-5">
      <div className="min-w-0 space-y-3">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {Icon ? <Icon className="size-4 shrink-0 text-muted-foreground" /> : null}
            <p className="min-w-0 truncate text-sm font-medium text-muted-foreground">
              {name}
            </p>
          </div>

          {badge ? (
            <Badge
              variant={badgeType}
              className="min-w-0 max-w-[48%] shrink justify-start px-2 py-1"
            >
              <BadgeIcon className="size-3 shrink-0" />
              <span className="truncate">{badge}</span>
            </Badge>
          ) : null}
        </div>

        <p className="min-w-0 truncate text-2xl font-semibold tracking-tight text-foreground">
          {stat}
        </p>

        {helper ? (
          <p className="min-w-0 truncate text-xs text-muted-foreground">
            {helper}
          </p>
        ) : null}
      </div>
    </Card>
  );
};

const ResponsiveExpenseKpiSkeleton = () => (
  <Card variant="kpi" className="min-w-0 overflow-hidden px-4 py-5">
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="h-7 w-16 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="h-8 w-24 animate-pulse rounded bg-muted" />
      <div className="h-3 w-32 animate-pulse rounded bg-muted" />
    </div>
  </Card>
);

export function ExpenseKpiSection({
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

  if (isLoading) {
    return (
      <div className={EXPENSE_KPI_GRID_CLASS}>
        {[0, 1, 2].map((i) => (
          <ResponsiveExpenseKpiSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="rounded-lg border border-border/70 bg-card p-4 text-sm text-muted-foreground">
        Select a project to view expense summary.
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200">
        <p className="text-sm font-medium">{error || "Failed to load project data"}</p>
      </div>
    );
  }

  return (
    <div className={EXPENSE_KPI_GRID_CLASS}>
      {expenseKpiCards.map((card) => (
        <ResponsiveExpenseKpiCard key={card.name} {...card} />
      ))}
    </div>
  );
}
