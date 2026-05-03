import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let rafId;

    if (target == null || target === 0) {
      rafId = requestAnimationFrame(() => setValue(0));
      return () => cancelAnimationFrame(rafId);
    }

    let startTime = null;

    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return value;
}

export function KpiCard({
  name,
  stat,
  rawValue = null,
  formatter = null,
  helper = null,
  icon: Icon = null,
  badge = null,
  badgeRawValue = null,
  badgeFormatter = null,
  badgeType = "neutral",
}) {
  const animated = useCountUp(rawValue ?? 0);
  const animatedBadge = useCountUp(badgeRawValue ?? 0);
  const displayStat = rawValue != null && formatter ? formatter(animated) : stat;
  const displayBadge = badgeRawValue != null && badgeFormatter ? badgeFormatter(animatedBadge) : badge;
  const isLoading = badgeType === "loading";

  if (isLoading) {
    return (
      <Card variant="kpi" className="min-w-0 py-5 px-4">
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

  const getBadgeIcon = () => {
    if (badgeType === "positive") {
      return <TrendingUp className="h-3 w-3" />;
    } else if (badgeType === "negative") {
      return <TrendingDown className="h-3 w-3" />;
    }
    return null;
  };

  return (
    <Card variant="kpi" className="min-w-0 py-5 px-4">
      <div className="min-w-0 space-y-2">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}
            <dt className="text-sm font-medium text-muted-foreground truncate">{name}</dt>
          </div>

          {badge && (
            <Badge variant={badgeType} className="min-w-0 max-w-[55%] flex-shrink justify-start truncate">
              {getBadgeIcon()}
              <span className="truncate">{displayBadge}</span>
            </Badge>
          )}
        </div>

        <dd className="min-w-0 break-words text-2xl font-semibold tracking-tight text-foreground">{displayStat}</dd>

        {helper && <p className="min-w-0 break-words text-xs text-muted-foreground">{helper}</p>}
      </div>
    </Card>
  );
}
