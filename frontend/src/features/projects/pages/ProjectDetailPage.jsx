import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserAuth } from "@/features/auth/context/AuthContext";
import { ProjectDetailContent } from "@/features/projects/components/ProjectDetailContent";
import { useActiveProject } from "@/features/projects/hooks/useActiveProject";
import { getProjectById } from "@/features/projects/services/projects";

const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { session } = UserAuth();
  const { setActiveProjectId } = useActiveProject();

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
      if (data?.id) {
        setActiveProjectId(data.id);
      }
    } catch {
      setProject(null);
      setLoadError("Unable to load this project from Supabase.");
    }
    setIsLoading(false);
  }, [projectId, session?.user?.id, setActiveProjectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  return (
    <SidebarProvider style={{ "--sidebar-width": "260px" }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Project Details" />
        <div className="p-6 md:p-8">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Loading project details...
              </CardContent>
            </Card>
          ) : loadError ? (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-red-600 font-medium">{loadError}</p>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={loadProject}>
                    Retry
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/projects")}
                  >
                    Back to Projects
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : !project ? (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-muted-foreground">Project not found.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/projects")}
                >
                  Back to Projects
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ProjectDetailContent project={project} onBack={() => navigate("/projects")} />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ProjectDetailPage;
