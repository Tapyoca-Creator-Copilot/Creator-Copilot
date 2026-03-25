import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserAuth } from "@/features/auth/context/AuthContext";
import { getProjectById } from "@/features/projects/services/projects";

const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { session } = UserAuth();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadProject = useCallback(async () => {
    if (!projectId || !session?.user?.id) {
      setProject(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError("");
    try {
      const { data } = await getProjectById(projectId, { userId: session?.user?.id });
      setProject(data || null);
    } catch {
      setProject(null);
      setLoadError("Unable to load this project from Supabase.");
    }
    setIsLoading(false);
  }, [projectId, session?.user?.id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const formatBudget = (amount, currency) => {
    if (typeof amount !== "number" || Number.isNaN(amount)) {
      return "—";
    }

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
      }).format(amount);
    } catch {
      return `${currency || "USD"} ${amount.toFixed(2)}`;
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString();
  };

  return (
    <SidebarProvider style={{ "--sidebar-width": "260px" }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Project Details" />
        <div className="p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">Loading project details...</CardContent>
            </Card>
          ) : loadError ? (
            <Card>
              <CardContent className="pt-6 space-y-3">
                <p className="text-sm text-red-600">{loadError}</p>
                <Button variant="outline" size="sm" onClick={loadProject}>Retry</Button>
              </CardContent>
            </Card>
          ) : !project ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">Project not found.</CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Description</p>
                  <p className="text-muted-foreground">{project.description}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <p><span className="font-medium">Project Type:</span> {project.projectType}</p>
                  <p><span className="font-medium">Currency:</span> {project.currency}</p>
                  <p><span className="font-medium">Budget Ceiling:</span> {formatBudget(project.budgetCeiling, project.currency)}</p>
                  <p><span className="font-medium">Created:</span> {formatDate(project.createdAt)}</p>
                  <p><span className="font-medium">Start Date:</span> {formatDate(project.startDate)}</p>
                  <p><span className="font-medium">Estimated End Date:</span> {formatDate(project.endDate)}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ProjectDetailPage;
