import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserAuth } from "@/features/auth/context/AuthContext";

import { EarningsKpiSection } from "@/features/analytics/components/kpi/EarningsKpiSection";
import AddEarningsDialog from "@/features/earnings/components/AddEarningsDialog";
import DeleteEarningsDialog from "@/features/earnings/components/DeleteEarningsDialog";
import EarningsFilters from "@/features/earnings/components/EarningsFilters";
import EarningsTable from "@/features/earnings/components/EarningsTable";
import EditEarningsDialog from "@/features/earnings/components/EditEarningsDialog";
import {
    createEarning,
    deleteEarning,
    exportEarningsAsCsv,
    getEarnings,
    resolveEarningSourceFilterValue,
    updateEarning,
} from "@/features/earnings/services/earnings";
import { getExpenses } from "@/features/expenses/services/expenses";
import { useActiveProject } from "@/features/projects/hooks/useActiveProject";

const Earnings = () => {
  const { session } = UserAuth();
  const {
    projects,
    activeProjectId: selectedProjectId,
    activeProject: selectedProject,
    isLoadingProjects,
  } = useActiveProject();

  const [earnings, setEarnings] = useState([]);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(false);

  const [kpiEarnings, setKpiEarnings] = useState([]);
  const [isLoadingKpiEarnings, setIsLoadingKpiEarnings] = useState(false);

  const [kpiExpenses, setKpiExpenses] = useState([]);

  const [search, setSearch] = useState("");
  const [sourceType, setSourceType] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [earningToEdit, setEarningToEdit] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [earningToDelete, setEarningToDelete] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const userName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.email?.split("@")[0] ||
    "User";

  const loadKpiEarnings = useCallback(async () => {
    if (!session?.user?.id || !selectedProjectId) {
      setKpiEarnings([]);
      setKpiExpenses([]);
      setIsLoadingKpiEarnings(false);
      return;
    }

    setIsLoadingKpiEarnings(true);
    const [earningsResult, expensesResult] = await Promise.allSettled([
      getEarnings({ userId: session.user.id, projectId: selectedProjectId }),
      getExpenses({ userId: session.user.id, projectId: selectedProjectId }),
    ]);
    setKpiEarnings(earningsResult.status === "fulfilled" ? earningsResult.value?.data || [] : []);
    setKpiExpenses(expensesResult.status === "fulfilled" ? expensesResult.value?.data || [] : []);
    setIsLoadingKpiEarnings(false);
  }, [selectedProjectId, session?.user?.id]);

  const loadEarnings = useCallback(async () => {
    if (!session?.user?.id || !selectedProjectId) {
      setEarnings([]);
      setIsLoadingEarnings(false);
      return;
    }

    setIsLoadingEarnings(true);
    try {
      const { data } = await getEarnings({
        userId: session.user.id,
        projectId: selectedProjectId,
      });
      setEarnings(data || []);
    } catch {
      setEarnings([]);
      toast.error("Unable to load earnings. Please try again.");
    }
    setIsLoadingEarnings(false);
  }, [selectedProjectId, session?.user?.id]);

  useEffect(() => {
    loadEarnings();
  }, [loadEarnings]);

  useEffect(() => {
    loadKpiEarnings();
  }, [loadKpiEarnings]);

  useEffect(() => {
    setSearch("");
  }, [selectedProjectId]);

  const rangedKpiEarnings = useMemo(() => {
    const start = selectedProject?.startDate?.slice(0, 10) ?? null;
    const end = selectedProject?.endDate?.slice(0, 10) ?? null;
    if (!start && !end) return kpiEarnings || [];
    return (kpiEarnings || []).filter((e) => {
      const d = e?.earningDate?.slice(0, 10);
      if (!d) return true;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }, [kpiEarnings, selectedProject?.startDate, selectedProject?.endDate]);

  const rangedKpiExpenses = useMemo(() => {
    const start = selectedProject?.startDate?.slice(0, 10) ?? null;
    const end = selectedProject?.endDate?.slice(0, 10) ?? null;
    if (!start && !end) return kpiExpenses || [];
    return (kpiExpenses || []).filter((e) => {
      const d = e?.expenseDate?.slice(0, 10);
      if (!d) return true;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }, [kpiExpenses, selectedProject?.startDate, selectedProject?.endDate]);

  const visibleEarnings = useMemo(() => {
    const projectStart = selectedProject?.startDate?.slice(0, 10) ?? null;
    const projectEnd = selectedProject?.endDate?.slice(0, 10) ?? null;

    const inRange = (earnings || []).filter((earning) => {
      if (!projectStart && !projectEnd) return true;
      const d = earning?.earningDate?.slice(0, 10);
      if (!d) return true;
      if (projectStart && d < projectStart) return false;
      if (projectEnd && d > projectEnd) return false;
      return true;
    });

    const bySource =
      sourceType === "all"
        ? inRange
        : inRange.filter((earning) => resolveEarningSourceFilterValue(earning?.sourceType) === sourceType);

    const query = search.trim().toLowerCase();
    if (!query) return bySource;

    return bySource.filter((earning) => {
      const haystack = [earning?.name, earning?.sourceType, earning?.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [earnings, search, selectedProject?.startDate, selectedProject?.endDate, sourceType]);

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
    if (!created) { loadEarnings(); loadKpiEarnings(); return; }

    const matchesProject = created.projectId === selectedProjectId;
    const matchesSource = sourceType === "all" || resolveEarningSourceFilterValue(created.sourceType) === sourceType;

    if (matchesProject && matchesSource) {
      setEarnings((prev) => [{ ...created, project: created.project || selectedProject }, ...(prev || [])]);
    } else {
      loadEarnings();
    }
    loadKpiEarnings();
  };

  const handleEarningUpdated = (updated) => {
    if (!updated) { loadEarnings(); loadKpiEarnings(); return; }
    setEarnings((prev) =>
      (prev || []).map((e) =>
        e.id === updated.id ? { ...updated, project: updated.project || e.project } : e
      )
    );
    loadKpiEarnings();
  };

  const handleEarningDeleted = (deletedId) => {
    if (!deletedId) { loadEarnings(); loadKpiEarnings(); return; }
    setEarnings((prev) => (prev || []).filter((e) => e.id !== deletedId));
    loadKpiEarnings();
  };

  const handleExportEarnings = async () => {
    if (!selectedProjectId) {
      toast.error("Select a project to export.");
      return;
    }

    try {
      setIsExporting(true);
      const { blob, filename } = await exportEarningsAsCsv(selectedProjectId, {
        userId: session.user.id,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "earnings.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("Earnings exported successfully");
    } catch (error) {
      toast.error(error?.message || "Unable to export CSV. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SidebarProvider style={{ "--sidebar-width": "260px" }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Earnings" />

        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Track your project earnings</h2>
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
                  onClick={handleExportEarnings}
                  disabled={isExporting || isLoadingProjects || projects.length === 0 || !selectedProjectId}
                >
                  {isExporting ? "Exporting..." : "Export CSV"}
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
            createFn={createEarning}
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
            updateFn={updateEarning}
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
            deleteFn={deleteEarning}
          />

          <EarningsKpiSection
            projectId={selectedProjectId}
            project={selectedProject}
            earnings={rangedKpiEarnings}
            expenses={rangedKpiExpenses}
            isLoading={isLoadingKpiEarnings}
          />

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Earnings Records</CardTitle>
              <CardDescription>
                {isProjectGateActive
                  ? "Select a project to view earnings."
                  : `Viewing earnings for ${selectedProject?.name || "your selected project"}.`}
              </CardDescription>
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
                  currency={selectedProject?.currency}
                  emptyTitle={sourceType === "all" ? "No earnings yet" : `No ${sourceType} earnings yet`}
                  emptyDescription={
                    search
                      ? "Try a different search term or clear filters."
                      : "Add your first earning to start tracking earnings."
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
