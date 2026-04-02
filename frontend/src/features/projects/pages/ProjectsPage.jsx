import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserAuth } from "@/features/auth/context/AuthContext";
import { EmptyProjectsGuide } from "@/features/projects/components/EmptyProjectsGuide";
import { ProjectListCard } from "@/features/projects/components/ProjectListCard";
import { getProjects } from "@/features/projects/services/projects";

const ProjectsPage = () => {
  const { session } = UserAuth();
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const loadProjects = useCallback(async () => {
    if (!session?.user?.id) {
      setProjects([]);
      setIsLoadingProjects(false);
      return;
    }

    setIsLoadingProjects(true);
    try {
      const { data } = await getProjects({ userId: session.user.id });
      setProjects(data || []);
    } catch {
      setProjects([]);
      toast.error("Unable to load projects. Please try again.");
    }
    setIsLoadingProjects(false);
  }, [session?.user?.id]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <SidebarProvider style={{ "--sidebar-width": "260px" }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Projects" />
        <div className="p-8">
          {isLoadingProjects ? (
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          ) : projects.length === 0 ? (
            <EmptyProjectsGuide />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <ProjectListCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ProjectsPage;
