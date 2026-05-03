import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SingleValueChartTooltip from "@/features/analytics/components/shared/SingleValueChartTooltip";
import { buildDepartmentData } from "@/features/analytics/utils/categoryBreakdown";
import { currencyFormatter } from "@/features/analytics/utils/formatters";
import { filterExpensesByTimeRange, getTimeRangeLabel } from "@/features/analytics/utils/graphTimeRange";
import { cn } from "@/lib/utils";
import { List, ListItem } from "@tremor/react";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const ExpenseCategoryBreakdownCard = ({
  projectId,
  expenses = [],
  isLoading = false,
  timeRange = "month",
  currency: projectCurrency,
  projectStartDate,
  projectEndDate,
}) => {
  const currency = useMemo(
    () => projectCurrency || expenses.find((expense) => expense?.project?.currency)?.project?.currency || "USD",
    [expenses, projectCurrency]
  );

  const filteredExpenses = useMemo(
    () => filterExpensesByTimeRange(expenses, timeRange, { projectStartDate, projectEndDate }),
    [expenses, projectEndDate, projectStartDate, timeRange]
  );

  const donutData = useMemo(() => buildDepartmentData(filteredExpenses), [filteredExpenses]);
  const timeRangeLabel = getTimeRangeLabel(timeRange).toLowerCase();

  if (!projectId) {
    return (
      <Card className="border-black/5 dark:border-white/10 bg-card">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Select a project to view {timeRangeLabel} expense departments.
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-black/5 dark:border-white/10 bg-card">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Loading department breakdown...
        </CardContent>
      </Card>
    );
  }

  if (!donutData.rows.length) {
    return (
      <Card className="border-black/5 dark:border-white/10 bg-card">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          No expense departments found for this {timeRangeLabel} view yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Total expenses by department</CardTitle>
        <p className="text-sm text-muted-foreground">
          {currencyFormatter(donutData.totalAmount, currency)} across {donutData.rows.length} departments
        </p>
      </CardHeader>

      <CardContent>
        <div className="mt-2 h-52 w-full [&_.recharts-surface]:outline-none [&_.recharts-sector]:outline-none [&_.recharts-layer]:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-2xl font-semibold"
              >
                {currencyFormatter(donutData.totalAmount, currency)}
              </text>
              <Pie
                data={donutData.rows}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
                innerRadius="68%"
                outerRadius="100%"
                stroke="var(--card)"
                strokeWidth={3}
                strokeLinejoin="round"
              >
                {donutData.rows.map((item) => (
                  <Cell key={`slice-${item.name}`} fill={item.colorHex} />
                ))}
              </Pie>
              <Tooltip
                isAnimationActive={false}
                cursor={false}
                wrapperStyle={{ outline: "none" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) {
                    return null;
                  }

                  const point = payload[0];
                  const name = point.name;
                  const amount = Number(point.value || 0);
                  const color = point?.payload?.colorHex || "var(--primary)";

                  return (
                    <SingleValueChartTooltip
                      title={name}
                      value={currencyFormatter(amount, currency)}
                      markerColor={color}
                      markerLabel="expenses"
                    />
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
          <span>Department</span>
          <span>Amount / Share</span>
        </p>

        <List className="mt-2">
          {donutData.rows.map((item) => (
            <ListItem key={item.name} className="space-x-6">
              <div className="flex items-center space-x-2.5 truncate">
                <span
                  className={cn("size-2.5 shrink-0 rounded-sm")}
                  style={{ backgroundColor: item.colorHex }}
                  aria-hidden={true}
                />
                <span className="truncate text-sm text-foreground">{item.name}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-medium tabular-nums text-foreground">
                  {currencyFormatter(item.amount, currency)}
                </span>
                <Badge variant="secondary">
                  {item.share}
                </Badge>
              </div>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ExpenseCategoryBreakdownCard;
