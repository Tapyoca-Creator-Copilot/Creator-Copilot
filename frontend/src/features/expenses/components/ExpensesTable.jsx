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
      <div className="rounded-lg border border-black/5 bg-card p-6">
        <p className="text-sm text-muted-foreground">Loading expenses...</p>
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="rounded-lg border border-black/5 bg-card p-8 text-center">
        <p className="font-semibold text-foreground">{emptyTitle}</p>
        <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  const currency = expenses.find((expense) => expense?.project?.currency)?.project?.currency || "USD";
  const total = expenses.reduce((sum, expense) => sum + (Number(expense?.amount) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{expenses.length}</span> transaction{expenses.length !== 1 ? 's' : ''}
        </p>
        <p className="text-sm font-medium text-foreground">
          Total: <span className="font-semibold">{formatCurrency(total, currency)}</span>
        </p>
      </div>

      <div className="rounded-lg border border-black/5 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-accent border-black/5">
              <TableHead className="px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider text-left flex-1">Date</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider text-left flex-1">Expense</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider text-left flex-1">Department</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider text-left flex-1">Amount</TableHead>
              <TableHead className="hidden md:table-cell px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider text-left flex-1">Vendor</TableHead>
              <TableHead className="hidden xl:table-cell px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider text-left flex-1">Notes</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider text-right flex-1">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id} className="border-black/5 hover:bg-accent/50 transition-colors">
                <TableCell className="px-6 py-4 text-sm text-foreground flex-1">{formatDate(expense.expenseDate)}</TableCell>
                <TableCell className="px-6 py-4 flex-1">
                  <div className="font-medium text-foreground">{expense.name}</div>
                </TableCell>
                <TableCell className="px-6 py-4 flex-1">
                  <Badge variant="secondary" className="font-medium">
                    {expense.department}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm font-semibold text-foreground flex-1">
                  {formatCurrency(Number(expense.amount), expense?.project?.currency || currency)}
                </TableCell>
                <TableCell className="hidden md:table-cell px-6 py-4 text-sm text-foreground flex-1">{expense.vendor || "—"}</TableCell>
                <TableCell className="hidden xl:table-cell px-6 py-4 text-sm text-muted-foreground flex-1">
                  {buildNotesPreview(expense.description)}
                </TableCell>
                <TableCell className="px-6 py-4 text-right flex-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Expense actions" className="hover:bg-foreground/10">
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
