import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const getStatusBadgeClasses = (status) => {
  if (!status) return "";

  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes("unhealthy")) {
    return "bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-500";
  }

  if (normalizedStatus.includes("healthy")) {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-500";
  }

  if (normalizedStatus.includes("signal")) {
    return "bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-500";
  }

  if (normalizedStatus.includes("category")) {
    return "bg-purple-100 text-purple-800 dark:bg-purple-400/10 dark:text-purple-500";
  }

  if (normalizedStatus.includes("activity")) {
    return "bg-cyan-100 text-cyan-800 dark:bg-cyan-400/10 dark:text-cyan-500";
  }

  return "";
};

const AIInsightCard = ({ title, summary, statusLabel }) => {
  const badgeClasses = getStatusBadgeClasses(statusLabel);

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="flex items-start justify-between gap-3 pb-0">
        <CardTitle className="text-base leading-6">{title}</CardTitle>
        {statusLabel ? (
          <span className={cn("inline-flex rounded-md px-2 py-1 text-xs font-medium", badgeClasses)}>
            {statusLabel}
          </span>
        ) : null}
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{summary}</p>
      </CardContent>
    </Card>
  );
};

export default AIInsightCard;
