import { buildEarningKpiData } from "@/features/analytics/utils/kpiMetrics";
import { useMemo } from "react";
import { KpiCard } from "./KpiCard";
import { buildEarningKpiCards } from "./presets";

export function EarningsKpiSection({
  projectId,
  project,
  earnings = [],
  expenses = [],
  isLoading = false,
}) {
  const kpiData = useMemo(() => buildEarningKpiData(earnings, project, expenses), [earnings, project, expenses]);
  const earningKpiCards = useMemo(() => buildEarningKpiCards({ kpiData }), [kpiData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <KpiCard key={i} badgeType="loading" />
        ))}
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="rounded-lg border border-border/70 bg-card p-4 text-sm text-muted-foreground">
        Select a project to view earnings summary.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {earningKpiCards.map((card) => (
        <KpiCard key={card.name} {...card} />
      ))}
    </div>
  );
}
