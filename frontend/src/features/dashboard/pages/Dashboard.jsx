import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserAuth } from '@/features/auth/context/AuthContext';
import { getProjects } from '@/features/projects/services/projects';

const Dashboard = () => {
  const { session } = UserAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  
  const full_name = session?.user?.user_metadata?.full_name || session?.user?.email;
  const occupation = session?.user?.user_metadata?.occupation || "User";

  const loadProjects = useCallback(async () => {
    if (!session?.user?.id) {
      setProjects([]);
      setIsLoadingProjects(false);
      return;
    }

    setIsLoadingProjects(true);
    try {
      const { data } = await getProjects({ userId: session?.user?.id });
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

  const formatBudget = (amount, currency) => {
    if (typeof amount !== "number" || Number.isNaN(amount)) {
      return "—";
    }

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency || "USD"} ${amount.toFixed(2)}`;
    }
  };

  return (
    <SidebarProvider style={{ "--sidebar-width": "260px" }}>
      <AppSidebar variant="inset"/>
      <SidebarInset>
        <SiteHeader title="Dashboard" />
          <div className="p-8">
            <div className="space-y-4 mt-4">
              <p>Welcome, {full_name} to your dashboard! Your role is {occupation}. Here you can manage your projects, view analytics, and access all your tools in one place.</p>
              <p>Use the navigation menu to explore different sections of your dashboard and stay on top of your creative work.</p>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProjects ? (
                  <p className="text-sm text-muted-foreground">Loading projects...</p>
                ) : projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No projects yet. Create your first project to get started.</p>
                ) : (
                  <div className="space-y-3">
                    {projects.map((project) => (
                      <div key={project.id} className="rounded-md border border-input/50 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            className="font-semibold text-left hover:underline"
                            onClick={() => navigate(`/projects/${project.id}`)}>
                            {project.name}
                          </button>
                          <p className="text-sm text-muted-foreground">{project.projectType}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                          <span>{formatBudget(project.budgetCeiling, project.currency)}</span>
                          <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                          <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Dashboard;