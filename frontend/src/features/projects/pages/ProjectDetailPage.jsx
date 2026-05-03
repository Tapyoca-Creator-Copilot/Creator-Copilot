import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserAuth } from "@/features/auth/context/AuthContext";
import ArchiveProjectDialog from "@/features/projects/components/ArchiveProjectDialog";
import EditProjectDialog from "@/features/projects/components/EditProjectDialog";
import { ProjectDetailContent } from "@/features/projects/components/ProjectDetailContent";
import { useActiveProject } from "@/features/projects/hooks/useActiveProject";
import { archiveProject, getProjectById } from "@/features/projects/services/projects";

const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { session } = UserAuth();
  const { refreshProjects } = useActiveProject();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isArchiving, setIsArchiving] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const handleArchiveProject = useCallback(async () => {
    if (!project?.id || !session?.user?.id) {
      return;
    }

    setIsArchiving(true);
    try {
      await archiveProject(project.id, { userId: session.user.id });
      toast.success("Project archived.");
      setIsArchiveDialogOpen(false);
      await refreshProjects();
      navigate("/projects");
    } catch (error) {
      toast.error(error?.message || "Unable to archive this project.");
    }
    setIsArchiving(false);
  }, [navigate, project?.id, refreshProjects, session?.user?.id]);

  const handleProjectUpdated = useCallback(
    async (updatedProject) => {
      setProject(updatedProject || null);
      await refreshProjects();
    },
    [refreshProjects]
  );

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
            <ProjectDetailContent
              project={project}
              onBack={() => navigate("/projects")}
              onEdit={() => setIsEditDialogOpen(true)}
              onArchive={() => setIsArchiveDialogOpen(true)}
              isArchiving={isArchiving}
            />
          )}

          <EditProjectDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            project={project}
            userId={session?.user?.id}
            onUpdated={handleProjectUpdated}
          />

          <ArchiveProjectDialog
              open={isArchiveDialogOpen}
              onOpenChange={setIsArchiveDialogOpen}
              projectName={project?.name}
              isArchiving={isArchiving}
              onConfirm={handleArchiveProject}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  };

  export default ProjectDetailPage;
