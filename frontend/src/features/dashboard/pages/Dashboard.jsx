import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ExpenseAreaChartCard from "@/features/analytics/components/ExpenseAreaChartCard";
import ExpenseCategoryDonutCard from "@/features/analytics/components/ExpenseCategoryDonutCard";
import { KPICard } from "@/features/analytics/components/kpi-cards/KPICard";
import { buildDashboardKpiCards } from "@/features/analytics/components/kpi-cards/kpiCardPresets";
import { useProjectAnalyticsData } from "@/features/analytics/hooks/useProjectAnalyticsData";
import { buildCategoryData } from "@/features/analytics/utils/categoryBreakdown";
import { currencyFormatter } from "@/features/analytics/utils/formatters";
import {
  buildExpenseTrendData,
  filterExpensesByTimeRange,
  getTimeRangeLabel,
  GRAPH_TIME_RANGE_OPTIONS,
} from "@/features/analytics/utils/graphTimeRange";
import { UserAuth } from "@/features/auth/context/AuthContext";
import AIInsightCard from "@/features/dashboard/components/AIInsightCard";
import {
  buildDashboardGreeting,
  getSessionDisplayName,
} from "@/features/dashboard/utils/greeting";
import { useActiveProject } from "@/features/projects/hooks/useActiveProject";
import { useMemo, useState } from "react";

const parseExpenseDate = (expense) => {
  const value = expense?.expenseDate || expense?.expense_date || expense?.date;
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateLabel = (date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });

const Dashboard = () => {
  const { session } = UserAuth();
  const { activeProjectId, activeProject } = useActiveProject();
  const [timeRange, setTimeRange] = useState("month");

  const { project, expenses, isLoading, error } = useProjectAnalyticsData({
    userId: session?.user?.id,
    projectId: activeProjectId,
  });

  const userDisplayName = getSessionDisplayName(session);
  const greeting = buildDashboardGreeting({ name: userDisplayName });

  const filteredExpenses = useMemo(
    () =>
      filterExpensesByTimeRange(expenses, timeRange, {
        projectStartDate: activeProject?.startDate,
        projectEndDate: activeProject?.endDate,
      }),
    [activeProject?.endDate, activeProject?.startDate, expenses, timeRange]
  );

  const trendData = useMemo(
    () =>
      buildExpenseTrendData(filteredExpenses, timeRange, {
        projectStartDate: activeProject?.startDate,
        projectEndDate: activeProject?.endDate,
      }),
    [activeProject?.endDate, activeProject?.startDate, filteredExpenses, timeRange]
  );

  const budgetAmount = Number(project?.budgetCeiling || 0);
  const spentAmount = filteredExpenses.reduce((sum, expense) => sum + Number(expense?.amount || 0), 0);
  const remainingAmount = budgetAmount - spentAmount;
  const budgetUsedPercent = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

  const categoryData = useMemo(() => buildCategoryData(filteredExpenses), [filteredExpenses]);
  const topCategory = categoryData.rows[0] || null;
  const topCategories = useMemo(() => categoryData.rows.slice(0, 3), [categoryData.rows]);

  const largestExpenses = useMemo(() => {
    if (!filteredExpenses.length) {
      return [];
    }

    return [...filteredExpenses].
      sort((left, right) => Number(right?.amount || 0) - Number(left?.amount || 0))
      .slice(0, 3);
  }, [filteredExpenses]);

  const recentExpenses = useMemo(() => {
    return [...filteredExpenses]
      .filter((expense) => parseExpenseDate(expense))
      .sort((left, right) => parseExpenseDate(right).getTime() - parseExpenseDate(left).getTime())
      .slice(0, 3);
  }, [filteredExpenses]);

  const averageExpense = filteredExpenses.length > 0 ? spentAmount / filteredExpenses.length : 0;
  const timeRangeLabel = getTimeRangeLabel(timeRange).toLowerCase();
  const dashboardKpiCards = buildDashboardKpiCards({
    currencyFormatter,
    budgetAmount,
    spentAmount,
    remainingAmount,
    budgetUsedPercent,
    filteredExpenses,
    averageExpense,
  });

  const aiInsights = useMemo(() => {
    const firstTrend = trendData[0]?.amount ?? 0;
    const latestTrend = trendData[trendData.length - 1]?.amount ?? 0;
    const changeAmount = latestTrend - firstTrend;
    const trendDirection =
      changeAmount > 0 ? "upward" : changeAmount < 0 ? "downward" : "stable";

    const recentDate = recentExpenses[0] ? parseExpenseDate(recentExpenses[0]) : null;

    return [
      {
        title: "Spending Trend Insight",
        summary:
          trendData.length < 2
            ? `Creator Copilot needs more ${timeRangeLabel} points before it can confidently detect a directional trend.`
            : `Creator Copilot sees a ${trendDirection} spending curve in this ${timeRangeLabel} window, moving from ${currencyFormatter(firstTrend)} to ${currencyFormatter(latestTrend)}.`,
        statusLabel: "AI signal",
      },
      {
        title: "Budget Health Insight",
        summary:
          budgetAmount <= 0
            ? "Budget ceiling is not defined yet, so budget pressure scoring is currently limited."
            : budgetUsedPercent > 90
              ? `Budget utilization is at ${budgetUsedPercent.toFixed(1)}%. Creator Copilot suggests reviewing high-cost entries before new spend is added.`
              : `Budget utilization is at ${budgetUsedPercent.toFixed(1)}%, with ${currencyFormatter(Math.max(remainingAmount, 0))} still available for the current project scope.`,
        statusLabel: budgetUsedPercent > 90 ? "Unhealthy" : "Healthy",
      },
      {
        title: "Top Category Insight",
        summary: topCategory
          ? `${topCategory.name} is currently the biggest cost driver at ${currencyFormatter(topCategory.amount)} (${topCategory.share}) of visible spend.`
          : "Category concentration will appear after expenses are categorized in the selected project.",
        statusLabel: "Category mix",
      },
      {
        title: "Recent Activity Insight",
        summary: recentExpenses.length
          ? `Most recent logged expense was ${currencyFormatter(recentExpenses[0].amount)}${recentDate ? ` on ${formatDateLabel(recentDate)}` : ""}. ${filteredExpenses.length} expenses are currently in view.`
          : "No recent entries are available in this range yet. Add new expenses to unlock activity insights.",
        statusLabel: "Activity",
      },
    ];
  }, [
    budgetAmount,
    budgetUsedPercent,
    filteredExpenses.length,
    recentExpenses,
    remainingAmount,
    timeRangeLabel,
    topCategory,
    trendData,
  ]);

  const projectContextLabel = activeProject?.name || project?.name || "No project selected";

  return (
    <SidebarProvider style={{ "--sidebar-width": "260px" }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Dashboard" />

        <div className="space-y-8 p-6 md:p-8">
          <section
            className="space-y-3 rounded-xl border bg-card from-background to-pearl-beige/10 px-8 py-12 md:py-16 text-center"
          >
            <p className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">{greeting}</p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              This dashboard summarizes the selected project using live expense data and Creator Copilot insights.
            </p>
          </section>

          <section className="flex flex-wrap justify-center gap-2 rounded-lg border border-border/70 bg-card p-3 mx-auto max-w-fit">
            {GRAPH_TIME_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTimeRange(option.value)}
                className={
                  timeRange === option.value
                    ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white"
                    : "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                }
              >
                {option.label}
              </button>
            ))}
          </section>

          {!activeProjectId ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Select a project from the header selector to load your financial dashboard.
              </CardContent>
            </Card>
          ) : null}

          {error ? (
            <Card>
              <CardContent className="pt-6 text-sm text-red-600 dark:text-red-400">
                {error}
              </CardContent>
            </Card>
          ) : null}

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboardKpiCards.map((card) => (
              <KPICard key={card.name} {...card} />
            ))}
          </section>

          <section className="space-y-5">
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold tracking-tight">Creator Copilot Insights</h3>
              <p className="text-sm text-muted-foreground">AI-style summaries generated from the currently visible project data.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {aiInsights.map((insight) => (
                <AIInsightCard
                  key={insight.title}
                  title={insight.title}
                  summary={insight.summary}
                  statusLabel={insight.statusLabel}
                />
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ExpenseAreaChartCard
              projectId={activeProjectId}
              expenses={expenses}
              isLoading={isLoading}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              projectStartDate={activeProject?.startDate}
              projectEndDate={activeProject?.endDate}
              showTimeRangeFilter={false}
            />
            <ExpenseCategoryDonutCard
              projectId={activeProjectId}
              expenses={expenses}
              isLoading={isLoading}
              timeRange={timeRange}
              projectStartDate={activeProject?.startDate}
              projectEndDate={activeProject?.endDate}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Top Spending Categories</CardTitle>
                <CardDescription>Highest cost concentration in this view.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {topCategories.length ? (
                  topCategories.map((category) => (
                    <div key={category.name} className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
                      <p className="truncate text-foreground">{category.name}</p>
                      <p className="shrink-0 text-muted-foreground">
                        {currencyFormatter(category.amount)} · {category.share}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Add categorized expenses to surface this insight.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Largest Expenses</CardTitle>
                <CardDescription>Top 3 highest transactions in this view.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {largestExpenses.length ? (
                  largestExpenses.map((expense) => {
                    const expenseDate = parseExpenseDate(expense);
                    return (
                      <div key={expense.id} className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
                        <p className="truncate text-foreground">{expense.name || expense.category || "Expense"}</p>
                        <p className="shrink-0 text-muted-foreground">
                          {currencyFormatter(expense.amount)}{expenseDate ? ` · ${formatDateLabel(expenseDate)}` : ""}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground">Largest expenses will appear once entries are available.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest expense entries in this dataset.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {recentExpenses.length ? (
                  recentExpenses.map((expense) => {
                    const expenseDate = parseExpenseDate(expense);
                    return (
                      <div key={expense.id} className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
                        <p className="truncate text-foreground">{expense.name || expense.category || "Expense"}</p>
                        <p className="shrink-0 text-muted-foreground">
                          {currencyFormatter(expense.amount)}{expenseDate ? ` · ${formatDateLabel(expenseDate)}` : ""}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground">Recent activity will appear after expenses are added.</p>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Profit Insights</CardTitle>
                <CardDescription>Future financial intelligence block</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Revenue and profit tracking is not available yet. Once income data is added, Creator Copilot will surface profit trends, revenue summaries, and net-balance insights here.
              </CardContent>
            </Card>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;