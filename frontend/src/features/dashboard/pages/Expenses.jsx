import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { UserAuth } from "@/features/auth/context/AuthContext";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";

import AddExpenseDialog from "@/features/expenses/components/AddExpenseDialog";
import EditExpenseDialog from "@/features/expenses/components/EditExpenseDialog";
import DeleteExpenseDialog from "@/features/expenses/components/DeleteExpenseDialog";
import ExpenseFilters from "@/features/expenses/components/ExpenseFilters";
import ExpensesTable from "@/features/expenses/components/ExpensesTable";
import { getExpenses } from "@/features/expenses/services/expenses";
import { getProjects } from "@/features/projects/services/projects";

const Expenses = () => {
  const { session } = UserAuth();

  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [expenses, setExpenses] = useState([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const userName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.email?.split("@")[0] ||
    "User";

  const loadProjects = useCallback(async () => {
    if (!session?.user?.id) {
      setProjects([]);
      setSelectedProjectId("");
      setIsLoadingProjects(false);
      return;
    }

    setIsLoadingProjects(true);
    try {
      const { data } = await getProjects({ userId: session.user.id });
      setProjects(data || []);

      setSelectedProjectId((previous) => {
        if (previous && (data || []).some((project) => project.id === previous)) {
          return previous;
        }
        return "";
      });
    } catch {
      setProjects([]);
      setSelectedProjectId("");
      toast.error("Unable to load projects. Please try again.");
    }
    setIsLoadingProjects(false);
  }, [session?.user?.id]);

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
        department,
      });
      setExpenses(data || []);
    } catch {
      setExpenses([]);
      toast.error("Unable to load expenses. Please try again.");
    }
    setIsLoadingExpenses(false);
  }, [department, selectedProjectId, session?.user?.id]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const visibleExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return expenses;
    }

    return (expenses || []).filter((expense) => {
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
  }, [expenses, search]);

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
    const matchesDepartment = department === "all" || created.department === department;

    if (matchesProject && matchesDepartment) {
      setExpenses((previous) => [
        {
          ...created,
          project: created.project || selectedProject,
        },
        ...(previous || []),
      ]);
      return;
    }

    // It was created successfully, but doesn't match current filters.
    loadExpenses();
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
  };

  const handleExpenseDeleted = (deletedId) => {
    if (!deletedId) {
      loadExpenses();
      return;
    }

    setExpenses((previous) => (previous || []).filter((expense) => expense.id !== deletedId));
  };

  return (
    <SidebarProvider style={{ "--sidebar-width": "260px" }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Expenses" />

        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Track your project spending</h2>
            <p className="mt-1 text-muted-foreground">
              {userName}, choose a project, log expenses, and filter transactions by department.
            </p>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Project</CardTitle>
              <CardDescription>Select a project to view and add expenses.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="w-full md:max-w-lg">
                <Select
                  value={selectedProjectId}
                  onValueChange={(value) => {
                    setSelectedProjectId(value);
                    setSearch("");
                  }}
                  disabled={isLoadingProjects || projects.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingProjects
                          ? "Loading projects..."
                          : projects.length
                            ? "Select a project"
                            : "No projects available"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  disabled={projects.length === 0}
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

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Transactions</CardTitle>
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
                <div className="rounded-md border p-6">
                  <p className="font-medium">Select a project to get started</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Expenses are always associated with a project. Once selected, you’ll be able to search and filter by department.
                  </p>
                </div>
              ) : (
                <ExpensesTable
                  expenses={visibleExpenses}
                  isLoading={isLoadingExpenses}
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
