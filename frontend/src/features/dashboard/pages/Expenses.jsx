import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserAuth } from "@/features/auth/context/AuthContext";

import AddExpenseDialog from "@/features/expenses/components/AddExpenseDialog";
import DeleteExpenseDialog from "@/features/expenses/components/DeleteExpenseDialog";
import EditExpenseDialog from "@/features/expenses/components/EditExpenseDialog";
import ExpenseFilters from "@/features/expenses/components/ExpenseFilters";
import ExpensesTable from "@/features/expenses/components/ExpensesTable";
import { getBudgetSummary, getExpenses } from "@/features/expenses/services/expenses";
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

  const [budgetSummary, setBudgetSummary] = useState(null);
  const [isLoadingBudgetSummary, setIsLoadingBudgetSummary] = useState(false);

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

  const loadBudgetSummary = useCallback(async () => {
    if (!session?.user?.id || !selectedProjectId) {
      setBudgetSummary(null);
      setIsLoadingBudgetSummary(false);
      return;
    }

    setIsLoadingBudgetSummary(true);
    try {
      const summary = await getBudgetSummary(selectedProjectId);
      setBudgetSummary(summary || null);
    } catch {
      setBudgetSummary(null);
      toast.error("Unable to load budget summary. Please try again.");
    }
    setIsLoadingBudgetSummary(false);
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
        department,
      });
      setExpenses(data || []);
      loadBudgetSummary();
    } catch {
      setExpenses([]);
      toast.error("Unable to load expenses. Please try again.");
    }
    setIsLoadingExpenses(false);
  }, [department, loadBudgetSummary, selectedProjectId, session?.user?.id]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    loadBudgetSummary();
  }, [loadBudgetSummary]);

  useEffect(() => {
    setSearch("");
  }, [selectedProjectId]);

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
      loadBudgetSummary();
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
    loadBudgetSummary();
  };

  const handleExpenseDeleted = (deletedId) => {
    if (!deletedId) {
      loadExpenses();
      return;
    }

    setExpenses((previous) => (previous || []).filter((expense) => expense.id !== deletedId));
    loadBudgetSummary();
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
                  disabled={projects.length === 0 || !selectedProjectId}
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
          {!isProjectGateActive &&
            (isLoadingBudgetSummary ? (
              <Card>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Loading budget summary...</p>
                </CardContent>
              </Card>
            ) : budgetSummary ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/*Budget Ceiling Card*/}
                <Card>
                  <CardContent className="px-6">
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">
                      {formatBudget(budgetSummary.budgetCeiling, selectedProject?.currency)}
                    </p>
                  </CardContent>
                </Card>
                {/*Spent Card*/}
                <Card>
                  <CardContent className="px-6">
                    <p className="text-sm text-muted-foreground">Spent</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">
                      {formatBudget(budgetSummary.totalSpent, selectedProject?.currency)}
                    </p>
                  </CardContent>
                </Card>
                {/*Remaining Budget Card*/}
                <Card>
                  <CardContent className="px-6">
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p
                      className={`mt-1 text-xl font-semibold ${budgetSummary.overBudget ? "text-destructive" : "text-foreground"}`}>
                      {formatBudget(budgetSummary.remaining, selectedProject?.currency)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">No budget summary available.</p>
                </CardContent>
              </Card>
            ))}

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
