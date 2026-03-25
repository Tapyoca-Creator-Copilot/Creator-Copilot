import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { IconDotsVertical } from "@tabler/icons-react";

const formatCurrency = (value, currency = "USD") => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency || "USD"} ${value.toFixed(2)}`;
  }
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const buildNotesPreview = (text, limit = 60) => {
  if (!text) {
    return "—";
  }

  const normalized = String(text).trim();
  if (!normalized) {
    return "—";
  }

  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit).trim()}…`;
};

const ExpensesTable = ({
  expenses,
  isLoading,
  emptyTitle = "No expenses yet",
  emptyDescription = "Add your first expense to start tracking transactions.",
  onEditExpense,
  onDeleteExpense,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-md border border-input/50 p-6">
        <p className="text-sm text-muted-foreground">Loading expenses...</p>
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="rounded-md border border-input/50 p-6">
        <p className="font-medium">{emptyTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  const currency = expenses.find((expense) => expense?.project?.currency)?.project?.currency || "USD";
  const total = expenses.reduce((sum, expense) => sum + (Number(expense?.amount) || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{expenses.length}</span> transactions
        </p>
        <Badge variant="outline" className="text-muted-foreground border border-input/50">
          Total: <span className="ml-1 text-foreground">{formatCurrency(total, currency)}</span>
        </Badge>
      </div>

      <div className="rounded-md border border-input/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-30">Date</TableHead>
              <TableHead>Expense</TableHead>
              <TableHead className="hidden lg:table-cell">Project</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="hidden md:table-cell">Vendor</TableHead>
              <TableHead className="hidden xl:table-cell">Notes</TableHead>
              <TableHead className="w-15 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="align-top">{formatDate(expense.expenseDate)}</TableCell>
                <TableCell className="align-top">
                  <div className="font-medium">{expense.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground lg:hidden">
                    {expense?.project?.name || "—"}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell align-top">{expense?.project?.name || "—"}</TableCell>
                <TableCell className="align-top">
                  <Badge variant="outline" className="text-muted-foreground">
                    {expense.department}
                  </Badge>
                </TableCell>
                <TableCell className="text-right align-top">
                  {formatCurrency(Number(expense.amount), expense?.project?.currency || currency)}
                </TableCell>
                <TableCell className="hidden md:table-cell align-top">{expense.vendor || "—"}</TableCell>
                <TableCell className="hidden xl:table-cell align-top text-muted-foreground">
                  {buildNotesPreview(expense.description)}
                </TableCell>
                <TableCell className="text-right align-top">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Expense actions">
                        <IconDotsVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault();
                          onEditExpense?.(expense);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={(event) => {
                          event.preventDefault();
                          onDeleteExpense?.(expense);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ExpensesTable;
