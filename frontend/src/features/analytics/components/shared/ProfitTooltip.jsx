import { EARNING_COLOR, EXPENSE_COLOR } from "@/features/analytics/components/config/chartConfig";
import { currencyFormatter } from "@/features/analytics/utils/formatters";

const TooltipRow = ({ color, label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2">
      <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <span className="text-sm font-semibold text-foreground">{value}</span>
  </div>
);

const ProfitTooltip = ({ label, earnings, expenses, currency }) => {
  const profit = earnings - expenses;

  return (
    <div className="z-50 min-w-48 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground">
      <p className="pb-2 text-sm font-medium text-foreground">{label}</p>
      <div className="space-y-1.5 border-t border-border/60 pt-2">
        <TooltipRow
          color={EARNING_COLOR}
          label="Earnings"
          value={currencyFormatter(earnings, currency)}
        />
        <TooltipRow
          color={EXPENSE_COLOR}
          label="Expenses"
          value={currencyFormatter(expenses, currency)}
        />
        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-1.5">
          <span className="text-sm font-medium text-foreground">Net Profit</span>
          <span
            className="text-sm font-semibold"
            style={{ color: profit >= 0 ? EARNING_COLOR : EXPENSE_COLOR }}
          >
            {currencyFormatter(profit, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfitTooltip;
