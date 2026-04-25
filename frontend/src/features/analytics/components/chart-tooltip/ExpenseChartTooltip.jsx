import { cn } from "@/lib/utils";

const ExpenseChartTooltip = ({
  title,
  value,
  markerColor = "var(--primary)",
  markerLabel = "expenses",
  className,
}) => {
  return (
    <div className={cn("z-50 min-w-44 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground", className)}>
      <p className="pb-2 text-sm font-medium text-foreground">{title}</p>
      <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-2">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: markerColor }} />
          <span className="text-sm text-muted-foreground">{markerLabel}</span>
        </div>
        <span className="text-sm font-semibold text-foreground">{value}</span>
      </div>
    </div>
  );
};

export default ExpenseChartTooltip;
