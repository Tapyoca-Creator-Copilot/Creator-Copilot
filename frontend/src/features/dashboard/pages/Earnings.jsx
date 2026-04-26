import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserAuth } from "@/features/auth/context/AuthContext";

import AddEarningsDialog from "@/features/earnings/components/AddEarningsDialog";
import DeleteEarningsDialog from "@/features/earnings/components/DeleteEarningsDialog";
import EditEarningsDialog from "@/features/earnings/components/EditEarningsDialog";
import EarningsFilters from "@/features/earnings/components/EarningsFilters";
import EarningsTable from "@/features/earnings/components/EarningsTable";
import {
  createEarningInSupabase,
  createEarningViaApi,
  deleteEarningInSupabase,
  deleteEarningViaApi,
  getEarningsFromApi,
  getEarningsFromSupabase,
  updateEarningInSupabase,
  updateEarningViaApi,
} from "@/features/earnings/services/earnings";
import { useActiveProject } from "@/features/projects/hooks/useActiveProject";

const DATA_SOURCES = [
  { key: "supabase", label: "Supabase" },
  { key: "api", label: "Backend API" },
];

const Earnings = () => {
  const { session } = UserAuth();
  const {
    projects,
    activeProjectId: selectedProjectId,
    activeProject: selectedProject,
    isLoadingProjects,
  } = useActiveProject();

  const [dataSource, setDataSource] = useState("supabase");

  const [earnings, setEarnings] = useState([]);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(false);

  const [search, setSearch] = useState("");
  const [sourceType, setSourceType] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [earningToEdit, setEarningToEdit] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [earningToDelete, setEarningToDelete] = useState(null);

  const userName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.email?.split("@")[0] ||
    "User";

  const loadEarnings = useCallback(async () => {
    if (!session?.user?.id || !selectedProjectId) {
      setEarnings([]);
      setIsLoadingEarnings(false);
      return;
    }

    setIsLoadingEarnings(true);
    try {
      const fetchFn = dataSource === "supabase" ? getEarningsFromSupabase : getEarningsFromApi;
      const { data } = await fetchFn({
        userId: session.user.id,
        projectId: selectedProjectId,
        sourceType,
      });
      setEarnings(data || []);
    } catch {
      setEarnings([]);
      toast.error("Unable to load earnings. Please try again.");
    }
    setIsLoadingEarnings(false);
  }, [dataSource, sourceType, selectedProjectId, session?.user?.id]);

  useEffect(() => {
    loadEarnings();
  }, [loadEarnings]);

  useEffect(() => {
    setSearch("");
  }, [selectedProjectId]);

  const visibleEarnings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return earnings;

    return (earnings || []).filter((earning) => {
      const haystack = [earning?.name, earning?.sourceType, earning?.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [earnings, search]);

  const isProjectGateActive = !selectedProjectId;

  const handleEditEarning = (earning) => {
    setEarningToEdit(earning);
    setIsEditOpen(true);
  };

  const handleDeleteEarning = (earning) => {
    setEarningToDelete(earning);
    setIsDeleteOpen(true);
  };

  const handleEarningCreated = (created) => {
    if (!created) { loadEarnings(); return; }

    const matchesProject = created.projectId === selectedProjectId;
    const matchesSource = sourceType === "all" || created.sourceType === sourceType;

    if (matchesProject && matchesSource) {
      setEarnings((prev) => [{ ...created, project: created.project || selectedProject }, ...(prev || [])]);
      return;
    }
    loadEarnings();
  };

  const handleEarningUpdated = (updated) => {
    if (!updated) { loadEarnings(); return; }
    setEarnings((prev) =>
      (prev || []).map((e) =>
        e.id === updated.id ? { ...updated, project: updated.project || e.project } : e
      )
    );
  };

  const handleEarningDeleted = (deletedId) => {
    if (!deletedId) { loadEarnings(); return; }
    setEarnings((prev) => (prev || []).filter((e) => e.id !== deletedId));
  };

  const getCreateFn = () => dataSource === "supabase" ? createEarningInSupabase : createEarningViaApi;
  const getUpdateFn = () => dataSource === "supabase" ? updateEarningInSupabase : updateEarningViaApi;
  const getDeleteFn = () => dataSource === "supabase" ? deleteEarningInSupabase : deleteEarningViaApi;

  return (
    <SidebarProvider style={{ "--sidebar-width": "260px" }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Earnings" />

        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Track your project revenue</h2>
            <p className="mt-1 text-muted-foreground">
              {userName}, choose a project, log earnings, and filter by source type.
            </p>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Active Project</CardTitle>
              <CardDescription>
                {isLoadingProjects
                  ? "Loading your projects..."
                  : selectedProject
                    ? "Use the project selector in the header to switch context."
                    : "Create a project to start tracking earnings."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="w-full md:max-w-lg">
                {isLoadingProjects ? (
                  <p className="text-sm text-muted-foreground">Loading projects...</p>
                ) : selectedProject ? (
                  <div className="rounded-md border border-input/60 p-3">
                    <p className="text-sm text-muted-foreground">Currently viewing</p>
                    <p className="font-medium">{selectedProject.name}</p>
                  </div>
                ) : (
                  <div className="rounded-md border border-input/60 p-3">
                    <p className="font-medium">No project selected</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Create a project first, then pick it from the global selector in the header.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoadingProjects || projects.length === 0 || !selectedProjectId}
                >
                  Export CSV
                </Button>
                {!isLoadingProjects && projects.length === 0 ? (
                  <Button type="button" asChild>
                    <Link to="/projects/new">Create New Project</Link>
                  </Button>
                ) : null}
                <Button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  disabled={isLoadingProjects || !selectedProjectId}
                >
                  Add Earning
                </Button>
              </div>
            </CardContent>
          </Card>

          <AddEarningsDialog
            open={isAddOpen}
            onOpenChange={setIsAddOpen}
            session={session}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onCreated={handleEarningCreated}
            createFn={getCreateFn()}
          />

          <EditEarningsDialog
            open={isEditOpen}
            onOpenChange={(open) => {
              setIsEditOpen(open);
              if (!open) setEarningToEdit(null);
            }}
            session={session}
            projects={projects}
            selectedProjectId={selectedProjectId}
            earning={earningToEdit}
            onUpdated={handleEarningUpdated}
            updateFn={getUpdateFn()}
          />

          <DeleteEarningsDialog
            open={isDeleteOpen}
            onOpenChange={(open) => {
              setIsDeleteOpen(open);
              if (!open) setEarningToDelete(null);
            }}
            session={session}
            earning={earningToDelete}
            onDeleted={handleEarningDeleted}
            deleteFn={getDeleteFn()}
          />

          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle>Revenue Records</CardTitle>
                  <CardDescription>
                    {isProjectGateActive
                      ? "Select a project to view earnings."
                      : `Viewing earnings for ${selectedProject?.name || "your selected project"}.`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">Source:</span>
                  <div className="flex rounded-md border border-input overflow-hidden text-xs">
                    {DATA_SOURCES.map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setDataSource(key)}
                        className={`px-3 py-1.5 font-medium transition-colors ${
                          dataSource === key
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <EarningsFilters
                search={search}
                onSearchChange={setSearch}
                sourceType={sourceType}
                onSourceTypeChange={setSourceType}
                disabled={isProjectGateActive}
              />

              {isProjectGateActive ? (
                <div className="rounded-md border border-input/50 p-6">
                  <p className="font-medium">Select a project to get started</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Earnings are always associated with a project. Once selected, you'll be able to search and filter by source type.
                  </p>
                </div>
              ) : (
                <EarningsTable
                  earnings={visibleEarnings}
                  isLoading={isLoadingEarnings}
                  emptyTitle={sourceType === "all" ? "No earnings yet" : `No ${sourceType} earnings yet`}
                  emptyDescription={
                    search
                      ? "Try a different search term or clear filters."
                      : "Add your first earning to start tracking revenue."
                  }
                  onEditEarning={handleEditEarning}
                  onDeleteEarning={handleDeleteEarning}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Earnings;
