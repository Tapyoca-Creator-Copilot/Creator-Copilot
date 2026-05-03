import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CopilotSummaryCard = ({ bullets = [], isLoading = false }) => {
  return (
    <Card className="border-black/5 dark:border-white/10">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          Creator Copilot AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" style={{ width: `${85 - i * 8}%` }} />
            ))}
          </div>
        ) : !bullets.length ? (
          <p className="text-sm text-muted-foreground">
            Select a project to see insights about project progress, expenses, earnings, and profitability.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/90">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {bullet}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default CopilotSummaryCard;
