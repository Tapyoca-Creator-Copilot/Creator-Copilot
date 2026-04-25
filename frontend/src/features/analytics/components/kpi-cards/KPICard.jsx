import { Card } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");
export function KPICard({
  name,
  stat,
  helper = null,
  icon: Icon = null,
  badge = null,
  badgeType = "neutral",
}) {
  const isLoading = badgeType === "loading";

  if (isLoading) {
    return (
      <Card variant="kpi" className="py-5 px-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-40 animate-pulse rounded bg-muted" />
        </div>
      </Card>
    );
  }

  const badgeColorClasses = {
    positive: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-500",
    negative: "bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-500",
    neutral: "bg-slate-100 text-slate-800 dark:bg-slate-400/10 dark:text-slate-500",
  };

  const getBadgeIcon = () => {
    if (badgeType === "positive") {
      return <TrendingUp className="h-3 w-3" />;
    } else if (badgeType === "negative") {
      return <TrendingDown className="h-3 w-3" />;
    }
    return null;
  };

  const getChangeIcon = () => {
    if (changeType === "positive") {
      return <TrendingUp className="h-4 w-4" />;
    } else if (changeType === "negative") {
      return <TrendingDown className="h-4 w-4" />;
    }
    return null;
  };

  return (
    <Card variant="kpi" className="py-5 px-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}
            <dt className="text-sm font-medium text-muted-foreground truncate">{name}</dt>
          </div>

          {badge && (
            <span
              className={cn(
                badgeColorClasses[badgeType] || badgeColorClasses.neutral,
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap flex-shrink-0"
              )}
            >
              {getBadgeIcon()}
              {badge}
            </span>
          )}
        </div>

        <dd className="text-2xl font-semibold tracking-tight text-foreground">{stat}</dd>

        {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      </div>
    </Card>
  );
}
