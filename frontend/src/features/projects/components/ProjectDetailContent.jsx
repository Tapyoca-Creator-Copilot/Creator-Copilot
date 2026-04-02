import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBudget, formatDate } from "@/features/projects/utils/formatters";

export const ProjectDetailContent = ({ project, onBack }) => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {project.name}
          </h1>
          <p className="text-base text-foreground/75 leading-relaxed">
            {project.description}
          </p>
        </div>
        {project.projectType && (
          <div className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground whitespace-nowrap">
            {project.projectType}
          </div>
        )}
      </div>

      <Card className="border-black/5">
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-accent px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Budget Ceiling
              </p>
              <p className="mt-2 text-lg font-bold text-foreground">
                {formatBudget(project.budgetCeiling, project.currency)}
              </p>
            </div>
            <div className="rounded-lg bg-accent px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Currency
              </p>
              <p className="mt-2 text-lg font-bold text-foreground">
                {project.currency || "—"}
              </p>
            </div>
            <div className="rounded-lg bg-accent px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Created
              </p>
              <p className="mt-2 text-lg font-bold text-foreground">
                {formatDate(project.createdAt)}
              </p>
            </div>
          </div>

          <div className="border-t border-black/5 pt-6">
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Timeline
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-accent px-4 py-3">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Start Date
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {formatDate(project.startDate)}
                </p>
              </div>
              <div className="rounded-lg bg-accent px-4 py-3">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Estimated End Date
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {formatDate(project.endDate)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="default" onClick={onBack}>
          Back to Projects
        </Button>
      </div>
    </div>
  );
};
