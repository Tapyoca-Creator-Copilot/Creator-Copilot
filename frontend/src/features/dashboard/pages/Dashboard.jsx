import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EarningsSourceBreakdownCard from "@/features/analytics/components/cards/EarningsSourceBreakdownCard";
import EarningsTrendCard from "@/features/analytics/components/cards/EarningsTrendCard";
import ExpenseCategoryBreakdownCard from "@/features/analytics/components/cards/ExpenseCategoryBreakdownCard";
import ExpensesTrendCard from "@/features/analytics/components/cards/ExpensesTrendCard";
import ProfitTrendCard from "@/features/analytics/components/cards/ProfitTrendCard";
import { KpiCard } from "@/features/analytics/components/kpi/KpiCard";
import {
  buildEarningsTabCards,
  buildProfitTabCards,
} from "@/features/analytics/components/kpi/presets";
import { useProjectAnalyticsData } from "@/features/analytics/hooks/useProjectAnalyticsData";
import { buildDepartmentData, buildEarningSourceData } from "@/features/analytics/utils/categoryBreakdown";
import { currencyFormatter } from "@/features/analytics/utils/formatters";
import { buildProfitTrendData, GRAPH_TIME_RANGE_OPTIONS } from "@/features/analytics/utils/graphTimeRange";
import { UserAuth } from "@/features/auth/context/AuthContext";
import CopilotSummaryCard from "@/features/dashboard/components/CopilotSummaryCard";
import { buildCopilotSummary } from "@/features/dashboard/utils/copilotSummary";
import {
  buildDashboardGreeting,
  getSessionDisplayName,
} from "@/features/dashboard/utils/greeting";
import { useActiveProject } from "@/features/projects/hooks/useActiveProject";
import { Briefcase, CreditCard, Percent, Scale, Target } from "lucide-react";
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

const parseEarningDate = (earning) => {
  const value = earning?.earningDate || earning?.earning_date || earning?.date;
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const ActivityList = ({
  items = [],
  emptyMessage,
  title = "Recent Activity",
  description = "Latest entries in this project.",
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-2 text-sm">
      {items.length ? (
        items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-b-0 last:pb-0"
          >
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                {item.kind ? (
                  <Badge variant={item.kind === "earning" ? "positive" : "negative"}>
                    {item.kind === "earning" ? "Earning" : "Expense"}
                  </Badge>
                ) : null}
                <p className="truncate text-foreground">{item.name}</p>
              </div>
              <p className="text-xs text-muted-foreground">{item.meta}</p>
            </div>
            <p
              className={`shrink-0 font-medium ${
                item.kind === "earning"
                  ? "text-area-chart-earning-stroke"
                  : "text-area-chart-expense-stroke"
              }`}
            >
              {item.amountLabel}
            </p>
          </div>
        ))
      ) : (
        <p className="text-muted-foreground">{emptyMessage}</p>
      )}
    </CardContent>
  </Card>
);

const DetailRow = ({ id, title, subtitle, value }) => (
  <div
    key={id}
    className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-b-0 last:pb-0"
  >
    <div className="min-w-0">
      <p className="truncate text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
    <p className="shrink-0 font-medium text-foreground">{value}</p>
  </div>
);

const Dashboard = () => {
  const { session } = UserAuth();
  const { activeProjectId, activeProject } = useActiveProject();
  const [timeRange, setTimeRange] = useState("month");

  const { project, expenses, earnings, isLoading, error } = useProjectAnalyticsData({
    userId: session?.user?.id,
    projectId: activeProjectId,
  });

  const projectCurrency = project?.currency || activeProject?.currency || "USD";
  const formatMoney = useMemo(
    () => (value) => currencyFormatter(value, projectCurrency),
    [projectCurrency]
  );

  const userDisplayName = getSessionDisplayName(session);
  const greeting = buildDashboardGreeting({ name: userDisplayName });

  const filteredExpenses = useMemo(() => {
    const start = activeProject?.startDate?.slice(0, 10) ?? null;
    const end = activeProject?.endDate?.slice(0, 10) ?? null;
    if (!start && !end) return expenses || [];
    return (expenses || []).filter((e) => {
      const d = (e?.expenseDate ?? e?.expense_date)?.slice(0, 10);
      if (!d) return true;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }, [expenses, activeProject?.startDate, activeProject?.endDate]);

  const filteredEarnings = useMemo(() => {
    const start = activeProject?.startDate?.slice(0, 10) ?? null;
    const end = activeProject?.endDate?.slice(0, 10) ?? null;
    if (!start && !end) return earnings || [];
    return (earnings || []).filter((e) => {
      const d = e?.earningDate?.slice(0, 10);
      if (!d) return true;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }, [earnings, activeProject?.startDate, activeProject?.endDate]);

  const budgetAmount = Number(project?.budgetCeiling || 0);
  const spentAmount = filteredExpenses.reduce((sum, expense) => sum + Number(expense?.amount || 0), 0);
  const remainingAmount = budgetAmount - spentAmount;
  const budgetUsedPercent = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

  const departmentData = useMemo(() => buildDepartmentData(filteredExpenses), [filteredExpenses]);
  const topDepartment = departmentData.rows[0] || null;
  const topDepartments = useMemo(() => departmentData.rows.slice(0, 5), [departmentData.rows]);

  const earningSourceData = useMemo(() => buildEarningSourceData(filteredEarnings), [filteredEarnings]);
  const topEarningSources = useMemo(() => earningSourceData.rows.slice(0, 5), [earningSourceData.rows]);

  const largestExpenses = useMemo(() => {
    if (!filteredExpenses.length) {
      return [];
    }

    return [...filteredExpenses].
      sort((left, right) => Number(right?.amount || 0) - Number(left?.amount || 0))
      .slice(0, 5);
  }, [filteredExpenses]);

  const recentExpenses = useMemo(() => {
    return [...filteredExpenses]
      .filter((expense) => parseExpenseDate(expense))
      .sort((left, right) => parseExpenseDate(right).getTime() - parseExpenseDate(left).getTime())
      .slice(0, 5);
  }, [filteredExpenses]);

  const totalEarnings = filteredEarnings.reduce((sum, e) => sum + Number(e?.amount || 0), 0);
  const netProfit = totalEarnings - spentAmount;
  const profitMargin = totalEarnings > 0 ? (netProfit / totalEarnings) * 100 : 0;
  const earningsCount = filteredEarnings.length;
  const avgEarning = earningsCount > 0 ? totalEarnings / earningsCount : 0;

  const overviewKpiCards = [
    {
      name: "Total Budget",
      stat: formatMoney(budgetAmount),
      rawValue: budgetAmount,
      formatter: formatMoney,
      icon: Briefcase,
      helper: "Project budget ceiling",
    },
    {
      name: "Total Spent",
      stat: formatMoney(spentAmount),
      rawValue: spentAmount,
      formatter: formatMoney,
      icon: CreditCard,
      helper: `Across ${filteredExpenses.length} expense${filteredExpenses.length !== 1 ? "s" : ""}`,
    },
    {
      name: "Remaining Budget",
      stat: formatMoney(remainingAmount),
      rawValue: remainingAmount,
      formatter: formatMoney,
      icon: Target,
      helper: remainingAmount < 0 ? "Over budget" : "Available to allocate",
      badge: remainingAmount < 0 ? "Over budget" : "On track",
      badgeType: remainingAmount < 0 ? "negative" : "positive",
    },
    {
      name: "Net Profit",
      stat: formatMoney(netProfit),
      rawValue: netProfit,
      formatter: formatMoney,
      icon: Scale,
      helper: netProfit >= 0 ? "Above break-even" : "Below break-even",
      badge: netProfit >= 0 ? "Profitable" : "In the red",
      badgeType: netProfit >= 0 ? "positive" : "negative",
    },
  ];

  const expenseKpiCards = [
    {
      name: "Total Spent",
      stat: formatMoney(spentAmount),
      rawValue: spentAmount,
      formatter: formatMoney,
      icon: CreditCard,
      helper: `Across ${filteredExpenses.length} expense${filteredExpenses.length !== 1 ? "s" : ""}`,
    },
    {
      name: "Budget Used",
      stat: budgetAmount > 0 ? `${budgetUsedPercent.toFixed(1)}%` : "—",
      rawValue: budgetAmount > 0 ? budgetUsedPercent : null,
      formatter: (value) => `${value.toFixed(1)}%`,
      icon: Percent,
      helper: budgetAmount > 0 ? "Share of budget spent" : "Set a budget to enable ratio",
      badge: budgetAmount > 0 ? (budgetUsedPercent > 90 ? "High usage" : "On track") : "—",
      badgeType: budgetAmount > 0 && budgetUsedPercent > 90 ? "negative" : "positive",
    },
    {
      name: "Remaining Budget",
      stat: formatMoney(remainingAmount),
      rawValue: remainingAmount,
      formatter: formatMoney,
      icon: Target,
      helper: remainingAmount < 0 ? "Over budget" : "Available to allocate",
      badge: remainingAmount < 0 ? "Over budget" : "On track",
      badgeType: remainingAmount < 0 ? "negative" : "positive",
    },
  ];

  const earningsKpiCards = buildEarningsTabCards({
    currencyFormatter: formatMoney,
    totalEarnings,
    avgEarning,
    earningsCount,
    spentAmount,
  });

  const profitKpiCards = buildProfitTabCards({
    currencyFormatter: formatMoney,
    totalEarnings,
    netProfit,
    profitMargin,
  });

  const profitTrendData = useMemo(
    () =>
      buildProfitTrendData(filteredEarnings, filteredExpenses, timeRange, {
        projectStartDate: activeProject?.startDate,
        projectEndDate: activeProject?.endDate,
      }),
    [activeProject?.endDate, activeProject?.startDate, filteredEarnings, filteredExpenses, timeRange]
  );

  const topProfitPeriods = useMemo(() => {
    return [...profitTrendData]
      .filter((point) => Number(point?.profit || 0) > 0)
      .sort((left, right) => Number(right?.profit || 0) - Number(left?.profit || 0))
      .slice(0, 5);
  }, [profitTrendData]);

  const copilotSummaryBullets = useMemo(
    () =>
      buildCopilotSummary({
        project: project || activeProject,
        budgetAmount,
        spentAmount,
        totalEarnings,
        netProfit,
        profitMargin,
        budgetUsedPercent,
        earningsCount,
        expensesCount: filteredExpenses.length,
        topDepartment,
        topEarningSource: topEarningSources[0] || null,
        formatMoney,
      }),
    [
      activeProject,
      budgetAmount,
      budgetUsedPercent,
      formatMoney,
      filteredExpenses.length,
      earningsCount,
      netProfit,
      profitMargin,
      project,
      spentAmount,
      topDepartment,
      topEarningSources,
      totalEarnings,
    ]
  );

  const recentEarnings = useMemo(() => {
    return [...filteredEarnings]
      .filter((earning) => parseEarningDate(earning))
      .sort((left, right) => parseEarningDate(right).getTime() - parseEarningDate(left).getTime())
      .slice(0, 5);
  }, [filteredEarnings]);

  const largestEarnings = useMemo(() => {
    if (!filteredEarnings.length) {
      return [];
    }

    return [...filteredEarnings]
      .sort((left, right) => Number(right?.amount || 0) - Number(left?.amount || 0))
      .slice(0, 5);
  }, [filteredEarnings]);

  const recentActivity = useMemo(() => {
    const expenseItems = filteredExpenses
      .map((expense) => {
      const date = parseExpenseDate(expense);
      if (!date) return null;
      return {
        id: `expense-${expense.id}`,
        kind: "expense",
        date,
        name: expense.name || expense.category || "Expense",
        meta: `${formatDateLabel(date)} · ${expense.department || "Expense"}`,
        amountLabel: `-${formatMoney(Number(expense.amount || 0))}`,
      };
    })
      .filter(Boolean);

    const earningItems = filteredEarnings
      .map((earning) => {
        const date = parseEarningDate(earning);
        if (!date) return null;
        return {
          id: `earning-${earning.id}`,
        kind: "earning",
        date,
        name: earning.name || earning.sourceType || "Earning",
        meta: `${formatDateLabel(date)} · ${earning.sourceType || "Earnings"}`,
        amountLabel: `+${formatMoney(Number(earning.amount || 0))}`,
      };
    })
      .filter(Boolean);

    return [...expenseItems, ...earningItems]
      .sort((left, right) => right.date.getTime() - left.date.getTime())
      .slice(0, 5);
  }, [filteredEarnings, filteredExpenses, formatMoney]);

  const profitHealthMessage = useMemo(() => {
    if (totalEarnings <= 0 && spentAmount <= 0) {
      return "Add earnings and expenses to start tracking profitability.";
    }
    if (totalEarnings <= 0) {
      return "No earnings have been logged yet, so the project is not at break-even.";
    }
    if (netProfit > 0) {
      return `This project is profitable by ${formatMoney(netProfit)}.`;
    }
    if (netProfit === 0) {
      return "This project is exactly at break-even.";
    }
    return `This project needs ${formatMoney(Math.abs(netProfit))} more earnings to break even.`;
  }, [formatMoney, netProfit, spentAmount, totalEarnings]);

  const breakEvenCoverage = spentAmount > 0 ? (totalEarnings / spentAmount) * 100 : totalEarnings > 0 ? 100 : 0;
  const breakEvenDelta = netProfit >= 0 ? netProfit : Math.abs(netProfit);
  const profitHealthLabel =
    totalEarnings <= 0
      ? "Waiting for earnings"
      : profitMargin >= 50
        ? "Strong"
        : profitMargin >= 20
          ? "Healthy"
          : profitMargin >= 0
            ? "Thin"
            : "Below break-even";

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
              This dashboard gives you a clear financial overview of the selected project, including expenses, earnings, profit, and Creator Copilot insights.
            </p>
          </section>

          <CopilotSummaryCard bullets={copilotSummaryBullets} isLoading={isLoading} />

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

          <Tabs defaultValue="overview" className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="profit">Profit</TabsTrigger>
              </TabsList>

              <section className="inline-flex h-10 w-full items-center justify-start rounded-lg border border-border bg-background p-1 text-muted-foreground sm:w-fit lg:ml-auto">
                {GRAPH_TIME_RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTimeRange(option.value)}
                    className={
                      timeRange === option.value
                        ? "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-md border border-transparent bg-primary px-2 py-1 text-sm font-medium text-primary-foreground transition-colors"
                        : "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-md border border-transparent px-2 py-1 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </section>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {overviewKpiCards.map((card) => (
                  <KpiCard key={card.name} {...card} />
                ))}
              </section>

              <section className="grid grid-cols-1 gap-6">
                <ActivityList
                  items={recentActivity}
                  emptyMessage="Recent activity will appear after expenses or earnings are added."
                />
              </section>

              <ProfitTrendCard
                projectId={activeProjectId}
                earnings={filteredEarnings}
                expenses={filteredExpenses}
                isLoading={isLoading}
                timeRange={timeRange}
                currency={projectCurrency}
                projectStartDate={activeProject?.startDate}
                projectEndDate={activeProject?.endDate}
              />
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6">
              <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {expenseKpiCards.map((card) => (
                  <KpiCard key={card.name} {...card} />
                ))}
              </section>

              <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Expense Departments</CardTitle>
                    <CardDescription>Top 5 cost concentrations in this view.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {topDepartments.length ? (
                      topDepartments.map((department) => (
                        <DetailRow
                          key={department.name}
                          id={department.name}
                          title={department.name}
                          subtitle={formatMoney(department.amount)}
                          value={department.share}
                        />
                      ))
                    ) : (
                      <p className="text-muted-foreground">Add expenses to surface this insight.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Largest Expenses</CardTitle>
                    <CardDescription>Top 5 highest expense transactions in this view.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {largestExpenses.length ? (
                      largestExpenses.map((expense) => {
                        const expenseDate = parseExpenseDate(expense);
                        return (
                          <DetailRow
                            key={expense.id}
                            id={expense.id}
                            title={expense.name || expense.category || "Expense"}
                            subtitle={expenseDate ? formatDateLabel(expenseDate) : "No date"}
                            value={formatMoney(Number(expense.amount || 0))}
                          />
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground">Largest expenses will appear once entries are available.</p>
                    )}
                  </CardContent>
                </Card>

                <ActivityList
                  title="Recent Expense Activity"
                  description="Top 5 latest expense entries in this view."
                  items={recentExpenses.map((expense) => {
                    const expenseDate = parseExpenseDate(expense);
                    return {
                      id: `expense-${expense.id}`,
                      kind: "expense",
                      name: expense.name || expense.category || "Expense",
                      meta: `${expenseDate ? formatDateLabel(expenseDate) : "No date"} · ${expense.department || "Expense"}`,
                      amountLabel: formatMoney(Number(expense.amount || 0)),
                    };
                  })}
                  emptyMessage="Recent expense activity will appear after expenses are added."
                />
              </section>

              <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <ExpensesTrendCard
                  projectId={activeProjectId}
                  expenses={filteredExpenses}
                  isLoading={isLoading}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                  currency={projectCurrency}
                  projectStartDate={activeProject?.startDate}
                  projectEndDate={activeProject?.endDate}
                  showTimeRangeFilter={false}
                />
                <ExpenseCategoryBreakdownCard
                  projectId={activeProjectId}
                  expenses={filteredExpenses}
                  isLoading={isLoading}
                  timeRange={timeRange}
                  currency={projectCurrency}
                  projectStartDate={activeProject?.startDate}
                  projectEndDate={activeProject?.endDate}
                />
              </section>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-6">
              <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {earningsKpiCards.map((card) => (
                  <KpiCard key={card.name} {...card} />
                ))}
              </section>

              <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Earning Sources</CardTitle>
                    <CardDescription>Top 5 earning concentrations in this view.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {topEarningSources.length ? (
                      topEarningSources.map((source) => (
                        <DetailRow
                          key={source.name}
                          id={source.name}
                          title={source.name}
                          subtitle={formatMoney(source.amount)}
                          value={source.share}
                        />
                      ))
                    ) : (
                      <p className="text-muted-foreground">Add earnings to surface this insight.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Largest Earnings</CardTitle>
                    <CardDescription>Top 5 highest earning transactions in this view.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {largestEarnings.length ? (
                      largestEarnings.map((earning) => {
                        const earningDate = parseEarningDate(earning);
                        return (
                          <DetailRow
                            key={earning.id}
                            id={earning.id}
                            title={earning.name || earning.sourceType || "Earning"}
                            subtitle={earningDate ? formatDateLabel(earningDate) : "No date"}
                            value={formatMoney(Number(earning.amount || 0))}
                          />
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground">Largest earnings will appear once entries are available.</p>
                    )}
                  </CardContent>
                </Card>

                <ActivityList
                  title="Recent Earning Activity"
                  description="Top 5 latest earning entries in this view."
                  items={recentEarnings.map((earning) => {
                    const earningDate = parseEarningDate(earning);
                    return {
                      id: `earning-${earning.id}`,
                      kind: "earning",
                      name: earning.name || earning.sourceType || "Earning",
                      meta: `${earningDate ? formatDateLabel(earningDate) : "No date"} · ${earning.sourceType || "Earnings"}`,
                      amountLabel: formatMoney(Number(earning.amount || 0)),
                    };
                  })}
                  emptyMessage="Recent earning activity will appear after earnings are added."
                />
              </section>

              <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
                <EarningsTrendCard
                  projectId={activeProjectId}
                  earnings={filteredEarnings}
                  isLoading={isLoading}
                  timeRange={timeRange}
                  currency={projectCurrency}
                  projectStartDate={activeProject?.startDate}
                  projectEndDate={activeProject?.endDate}
                />

                <EarningsSourceBreakdownCard
                  projectId={activeProjectId}
                  earnings={filteredEarnings}
                  isLoading={isLoading}
                  timeRange={timeRange}
                  currency={projectCurrency}
                />
              </section>
            </TabsContent>

            <TabsContent value="profit" className="space-y-6">
              <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {profitKpiCards.map((card) => (
                  <KpiCard key={card.name} {...card} />
                ))}
              </section>

              <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Break-even Status</CardTitle>
                    <CardDescription>Earnings compared with expenses.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <DetailRow
                      id="break-even-status"
                      title={netProfit >= 0 ? "Above break-even" : "Below break-even"}
                      subtitle={netProfit >= 0 ? "Earnings cover logged expenses" : "More earnings needed"}
                      value={formatMoney(breakEvenDelta)}
                    />
                    <DetailRow
                      id="break-even-coverage"
                      title="Expense Coverage"
                      subtitle={`${formatMoney(totalEarnings)} earned vs ${formatMoney(spentAmount)} spent`}
                      value={`${breakEvenCoverage.toFixed(0)}%`}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Profit Health</CardTitle>
                    <CardDescription>A simple read on project profitability.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <DetailRow
                      id="profit-health-label"
                      title={profitHealthLabel}
                      subtitle={profitHealthMessage}
                      value={totalEarnings > 0 ? `${profitMargin.toFixed(1)}%` : "—"}
                    />
                    <DetailRow
                      id="profit-health-net"
                      title="Net Profit"
                      subtitle={`${formatMoney(totalEarnings)} earnings - ${formatMoney(spentAmount)} expenses`}
                      value={formatMoney(netProfit)}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Profit Periods</CardTitle>
                    <CardDescription>Top 5 highest profit dates in this view.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {topProfitPeriods.length ? (
                      topProfitPeriods.map((period) => {
                        const periodMargin = period.earnings > 0 ? (period.profit / period.earnings) * 100 : 0;
                        return (
                          <DetailRow
                            key={period.date}
                            id={period.date}
                            title={period.date}
                            subtitle={formatMoney(period.profit)}
                            value={`${periodMargin.toFixed(0)}%`}
                          />
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground">Positive profit periods will appear once earnings exceed expenses.</p>
                    )}
                  </CardContent>
                </Card>
              </section>

              <ProfitTrendCard
                projectId={activeProjectId}
                earnings={filteredEarnings}
                expenses={filteredExpenses}
                isLoading={isLoading}
                timeRange={timeRange}
                currency={projectCurrency}
                projectStartDate={activeProject?.startDate}
                projectEndDate={activeProject?.endDate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;
