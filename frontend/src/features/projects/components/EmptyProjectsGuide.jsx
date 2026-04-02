import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const EmptyProjectsGuide = () => {
  const navigate = useNavigate();

  const handleCreateProject = () => {
    navigate("/projects/new");
  };

  return (
    <Card className="border bg-card shadow-none">
      <CardHeader>
        <CardTitle>Create Your First Project</CardTitle>
        <CardDescription>Get started by creating a project to track budgets, expenses, and timelines.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold">
              1
            </div>
            <div>
              <p className="font-medium text-foreground">Set your project details</p>
              <p className="text-xs text-muted-foreground">Name, description, and project type</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold">
              2
            </div>
            <div>
              <p className="font-medium text-foreground">Define your budget</p>
              <p className="text-xs text-muted-foreground">Set budget ceiling and currency</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold">
              3
            </div>
            <div>
              <p className="font-medium text-foreground">Track your progress</p>
              <p className="text-xs text-muted-foreground">Monitor the budget and expenses</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCreateProject}
          className="w-full gap-2 bg-chocolate hover:bg-chocolate-hover"
        >
          <Plus className="h-4 w-4" />
          Create Your First Project
        </Button>
      </CardContent>
    </Card>
  );
};
