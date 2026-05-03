import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserAuth } from "@/features/auth/context/AuthContext";

import { ExpenseKpiSection } from "@/features/analytics/components/kpi";
import AddExpenseDialog from "@/features/expenses/components/AddExpenseDialog";
import DeleteExpenseDialog from "@/features/expenses/components/DeleteExpenseDialog";
import EditExpenseDialog from "@/features/expenses/components/EditExpenseDialog";
import ExpenseFilters from "@/features/expenses/components/ExpenseFilters";
import ExpensesTable from "@/features/expenses/components/ExpensesTable";
import {
  exportProjectExpensesCsv,
  getExpenses,
  resolveExpenseDepartmentFilterValue,
} from "@/features/expenses/services/expenses";
import { useActiveProject } from "@/features/projects/hooks/useActiveProject";

const Expenses = () => {
  const { session } = UserAuth();
  const {
    projects,
    activeProjectId: selectedProjectId,
    activeProject: selectedProject,
    isLoadingProjects,
  } = useActiveProject();

  const [expenses, setExpenses] = useState([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);

  const [kpiExpenses, setKpiExpenses] = useState([]);
  const [isLoadingKpiExpenses, setIsLoadingKpiExpenses] = useState(false);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const userName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.email?.split("@")[0] ||
    "User";

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

  const loadKpiExpenses = useCallback(async () => {
    if (!session?.user?.id || !selectedProjectId) {
      setKpiExpenses([]);
      setIsLoadingKpiExpenses(false);
      return;
    }

    setIsLoadingKpiExpenses(true);
    try {
      const { data } = await getExpenses({
        userId: session.user.id,
        projectId: selectedProjectId,
      });
      setKpiExpenses(data || []);
    } catch {
      setKpiExpenses([]);
      toast.error("Unable to load KPI summary. Please try again.");
    }
    setIsLoadingKpiExpenses(false);
  }, [selectedProjectId, session?.user?.id]);

  const loadExpenses = useCallback(async () => {
    if (!session?.user?.id || !selectedProjectId) {
      setExpenses([]);
      setIsLoadingExpenses(false);
      return;
    }

    setIsLoadingExpenses(true);
    try {
      const { data } = await getExpenses({
        userId: session.user.id,
        projectId: selectedProjectId,
      });
      setExpenses(data || []);
    } catch {
      setExpenses([]);
      toast.error("Unable to load expenses. Please try again.");
    }
    setIsLoadingExpenses(false);
  }, [selectedProjectId, session?.user?.id]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    loadKpiExpenses();
  }, [loadKpiExpenses]);

  useEffect(() => {
    setSearch("");
  }, [selectedProjectId]);

  const visibleExpenses = useMemo(() => {
    const projectStart = selectedProject?.startDate?.slice(0, 10) ?? null;
    const projectEnd = selectedProject?.endDate?.slice(0, 10) ?? null;

    const inRange = (expenses || []).filter((expense) => {
      if (!projectStart && !projectEnd) return true;
      const d = expense?.expenseDate?.slice(0, 10);
      if (!d) return true;
      if (projectStart && d < projectStart) return false;
      if (projectEnd && d > projectEnd) return false;
      return true;
    });

    const byDepartment =
      department === "all"
        ? inRange
        : inRange.filter((expense) => resolveExpenseDepartmentFilterValue(expense?.department) === department);

    const query = search.trim().toLowerCase();
    if (!query) return byDepartment;

    return byDepartment.filter((expense) => {
      const haystack = [
        expense?.name,
        expense?.vendor,
        expense?.description,
        expense?.department,
        expense?.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [department, expenses, search, selectedProject?.startDate, selectedProject?.endDate]);

  const isProjectGateActive = !selectedProjectId;

  const handleEditExpense = (expense) => {
    setExpenseToEdit(expense);
    setIsEditOpen(true);
  };

  const handleDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
    setIsDeleteOpen(true);
  };

  const handleExpenseCreated = (created) => {
    if (!created) {
      loadExpenses();
      return;
    }

    const matchesProject = created.projectId === selectedProjectId;
    const matchesDepartment =
      department === "all" || resolveExpenseDepartmentFilterValue(created.department) === department;

    if (matchesProject && matchesDepartment) {
      setExpenses((previous) => [
        {
          ...created,
          project: created.project || selectedProject,
        },
        ...(previous || []),
      ]);
      loadKpiExpenses();
      return;
    }

    // It was created successfully, but doesn't match current filters.
    loadExpenses();
    loadKpiExpenses();
  };

  const handleExpenseUpdated = (updated) => {
    if (!updated) {
      loadExpenses();
      return;
    }

    setExpenses((previous) =>
      (previous || []).map((expense) =>
        expense.id === updated.id
          ? {
              ...updated,
              project: updated.project || expense.project,
            }
          : expense
      )
    );
    loadKpiExpenses();
  };

  const handleExpenseDeleted = (deletedId) => {
    if (!deletedId) {
      loadExpenses();
      return;
    }

    setExpenses((previous) => (previous || []).filter((expense) => expense.id !== deletedId));
    loadKpiExpenses();
  };

  const handleExportCsv = async () => {
    if (!session?.user?.id) {
      toast.error("You must be signed in to export.");
      return;
    }

    if (!selectedProjectId) {
      toast.error("Select a project to export.");
      return;
    }

    try {
      setIsExporting(true);
      const { blob, filename } = await exportProjectExpensesCsv(selectedProjectId, {
        userId: session.user.id,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "expenses.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
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
        <SiteHeader title="Expenses" />

        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Track your project expenses</h2>
            <p className="mt-1 text-muted-foreground">
              {userName}, choose a project, log expenses, and filter transactions by department.
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
                    : "Create a project to start tracking expenses."}
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
                  onClick={handleExportCsv}
                  disabled={isExporting || projects.length === 0 || !selectedProjectId}
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
                  Add Expense
                </Button>
              </div>
            </CardContent>
          </Card>

          <AddExpenseDialog
            open={isAddOpen}
            onOpenChange={setIsAddOpen}
            session={session}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onCreated={handleExpenseCreated}
          />

          <EditExpenseDialog
            open={isEditOpen}
            onOpenChange={(open) => {
              setIsEditOpen(open);
              if (!open) {
                setExpenseToEdit(null);
              }
            }}
            session={session}
            projects={projects}
            selectedProjectId={selectedProjectId}
            expense={expenseToEdit}
            onUpdated={handleExpenseUpdated}
          />

          <DeleteExpenseDialog
            open={isDeleteOpen}
            onOpenChange={(open) => {
              setIsDeleteOpen(open);
              if (!open) {
                setExpenseToDelete(null);
              }
            }}
            session={session}
            expense={expenseToDelete}
            onDeleted={handleExpenseDeleted}
          />

          <ExpenseKpiSection
            projectId={selectedProjectId}
            project={selectedProject}
            expenses={rangedKpiExpenses}
            isLoading={isLoadingKpiExpenses}
            error={null}
            timeRange="month"
            projectStartDate={selectedProject?.startDate}
            projectEndDate={selectedProject?.endDate}
          />

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                {isProjectGateActive
                  ? "Select a project to view transactions."
                  : `Viewing expenses for ${selectedProject?.name || "your selected project"}.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ExpenseFilters
                search={search}
                onSearchChange={setSearch}
                department={department}
                onDepartmentChange={setDepartment}
                disabled={isProjectGateActive}
              />

              {isProjectGateActive ? (
                <div className="rounded-md border border-input/50 p-6">
                  <p className="font-medium">Select a project to get started</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Expenses are always associated with a project. Once selected, you’ll be able to search and filter by department.
                  </p>
                </div>
              ) : (
                <ExpensesTable
                  expenses={visibleExpenses}
                  isLoading={isLoadingExpenses}
                  currency={selectedProject?.currency}
                  emptyTitle={department === "all" ? "No expenses yet" : `No ${department} expenses yet`}
                  emptyDescription={
                    search
                      ? "Try a different search term or clear filters."
                      : "Add your first expense to start tracking transactions."
                  }
                  onEditExpense={handleEditExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Expenses;
