import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserAuth } from "@/features/auth/context/AuthContext";
import ArchivedProjectCard from "@/features/projects/components/ArchivedProjectCard";
import { useArchivedProjects } from "@/features/projects/hooks/useArchivedProjects";

const ArchivedProjectsPage = () => {
  const { session } = UserAuth();
  const { projects, isLoading, recoveringProjectId, recoverProject } = useArchivedProjects(
    session?.user?.id
  );

  return (
    <SidebarProvider style={{ "--sidebar-width": "260px" }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Archived Projects" />
        <div className="p-8">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading archived projects...</p>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="text-sm text-muted-foreground">
                No archived projects yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <ArchivedProjectCard
                  key={project.id}
                  project={project}
                  isRecovering={recoveringProjectId === project.id}
                  onRecover={() => recoverProject(project)}
                />
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ArchivedProjectsPage;