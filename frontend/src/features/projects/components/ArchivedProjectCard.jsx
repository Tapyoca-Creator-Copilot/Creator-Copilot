import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBudget, formatDate } from "@/features/projects/utils/formatters";

const ArchivedProjectCard = ({ project, isRecovering, onRecover }) => {
  return (
    <Card className="border-black/5 dark:border-white/10 bg-card py-0">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-left text-base leading-tight font-semibold text-foreground md:text-lg">
            {project.name}
          </p>
          <p className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-foreground/80">
            {project.projectType || "General"}
          </p>
        </div>

        <p className="text-sm leading-relaxed text-foreground/75">
          {project.description || "No description added yet."}
        </p>

        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-md bg-accent px-3 py-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground">Budget</p>
            <p className="mt-1 font-semibold text-foreground">
              {formatBudget(project.budgetCeiling, project.currency)}
            </p>
          </div>
          <div className="rounded-md bg-accent px-3 py-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground">Start</p>
            <p className="mt-1 font-semibold text-foreground">{formatDate(project.startDate)}</p>
          </div>
          <div className="rounded-md bg-accent px-3 py-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground">Archived</p>
            <p className="mt-1 font-semibold text-foreground">{formatDate(project.archivedAt)}</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onRecover} disabled={isRecovering}>
            {isRecovering ? "Recovering..." : "Recover Project"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArchivedProjectCard;