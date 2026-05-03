import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPaginationItems } from "@/lib/pagination";
import { getNextSortState, sortRows } from "@/lib/tableSort";
import { IconDotsVertical } from "@tabler/icons-react";
import { useMemo, useState } from "react";

const ROWS_PER_PAGE = 20;

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

const EarningsTable = ({
  earnings,
  isLoading,
  emptyTitle = "No earnings yet",
  emptyDescription = "Add your first earning to start tracking earnings.",
  onEditEarning,
  onDeleteEarning,
  currency: projectCurrency,
}) => {
  const DEFAULT_SORT_DIRECTIONS = useMemo(
    () => ({
      date: "desc",
      earning: "asc",
      source: "asc",
      amount: "desc",
      notes: "asc",
    }),
    []
  );

  const SORT_CONFIG = useMemo(
    () => ({
      date: { type: "date", getValue: (row) => row?.earningDate },
      earning: { type: "text", getValue: (row) => row?.name },
      source: { type: "text", getValue: (row) => row?.sourceType },
      amount: { type: "number", getValue: (row) => row?.amount },
      notes: { type: "text", getValue: (row) => row?.description },
    }),
    []
  );

  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (nextKey) => {
    const next = getNextSortState(sortKey, sortDirection, nextKey, DEFAULT_SORT_DIRECTIONS);
    setSortKey(next.sortKey);
    setSortDirection(next.sortDirection);
    setCurrentPage(1);
  };

  const sortIndicator = (key) => {
    if (sortKey !== key) return null;
    return (
      <span className="ml-1 text-xs text-muted-foreground">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const sortedEarnings = useMemo(
    () => sortRows(earnings || [], { sortKey, sortDirection, sortConfig: SORT_CONFIG }),
    [earnings, sortDirection, sortKey, SORT_CONFIG]
  );

  const totalPages = Math.max(1, Math.ceil(sortedEarnings.length / ROWS_PER_PAGE));
  const boundedCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (boundedCurrentPage - 1) * ROWS_PER_PAGE;
  const pageEnd = pageStart + ROWS_PER_PAGE;
  const visibleEarnings = sortedEarnings.slice(pageStart, pageEnd);
  const paginationItems = useMemo(
    () => getPaginationItems(boundedCurrentPage, totalPages),
    [boundedCurrentPage, totalPages]
  );

  if (isLoading) {
    return (
      <div className="rounded-lg border border-black/5 dark:border-white/10 bg-card p-6">
        <p className="text-sm text-muted-foreground">Loading earnings...</p>
      </div>
    );
  }

  if (!earnings || earnings.length === 0) {
    return (
      <div className="rounded-lg border border-black/5 dark:border-white/10 bg-card p-8 text-center">
        <p className="font-semibold text-foreground">{emptyTitle}</p>
        <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  const currency = projectCurrency || (earnings || []).find((e) => e?.project?.currency)?.project?.currency || "USD";
  const total = (earnings || []).reduce((sum, e) => sum + (Number(e?.amount) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {pageStart + 1}-{Math.min(pageEnd, sortedEarnings.length)}
          </span>{" "}
          of <span className="font-semibold text-foreground">{earnings.length}</span> record{earnings.length !== 1 ? "s" : ""}
        </p>
        <p className="text-sm font-medium text-foreground">
          Total: <span className="font-semibold">{formatCurrency(total, currency)}</span>
        </p>
      </div>

      <div className="rounded-lg border border-black/5 dark:border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-accent border-black/5 dark:border-white/10">
              <TableHead
                className="px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider text-left flex-1 cursor-pointer select-none"
                onClick={() => handleSort("date")}
              >
                <span className="inline-flex items-center">
                  Date{sortIndicator("date")}
                </span>
              </TableHead>
              <TableHead
                className="px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider text-left flex-1 cursor-pointer select-none"
                onClick={() => handleSort("earning")}
              >
                <span className="inline-flex items-center">
                  Earning{sortIndicator("earning")}
                </span>
              </TableHead>
              <TableHead
                className="px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider text-left flex-1 cursor-pointer select-none"
                onClick={() => handleSort("source")}
              >
                <span className="inline-flex items-center">
                  Source{sortIndicator("source")}
                </span>
              </TableHead>
              <TableHead
                className="px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider text-left flex-1 cursor-pointer select-none"
                onClick={() => handleSort("amount")}
              >
                <span className="inline-flex items-center">
                  Amount{sortIndicator("amount")}
                </span>
              </TableHead>
              <TableHead
                className="hidden xl:table-cell px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider text-left flex-1 cursor-pointer select-none"
                onClick={() => handleSort("notes")}
              >
                <span className="inline-flex items-center">
                  Notes{sortIndicator("notes")}
                </span>
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider text-right flex-1">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleEarnings.map((earning) => (
              <TableRow key={earning.id} className="border-black/5 dark:border-white/10 hover:bg-accent/50 transition-colors">
                <TableCell className="px-6 py-4 text-sm text-foreground flex-1">{formatDate(earning.earningDate)}</TableCell>
                <TableCell className="px-6 py-4 flex-1">
                  <div className="font-medium text-foreground">{earning.name}</div>
                </TableCell>
                <TableCell className="px-6 py-4 flex-1">
                  <Badge variant="secondary" className="font-medium">
                    {earning.sourceType}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm font-semibold text-foreground flex-1">
                  {formatCurrency(Number(earning.amount), currency)}
                </TableCell>
                <TableCell className="hidden xl:table-cell px-6 py-4 text-sm text-muted-foreground flex-1">
                  {buildNotesPreview(earning.description)}
                </TableCell>
                <TableCell className="px-6 py-4 text-right flex-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Earning actions" className="hover:bg-foreground/10">
                        <IconDotsVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault();
                          onEditEarning?.(earning);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={(event) => {
                          event.preventDefault();
                          onDeleteEarning?.(earning);
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

      {totalPages > 1 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                type="button"
                disabled={boundedCurrentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, boundedCurrentPage - 1))}
              />
            </PaginationItem>
            {paginationItems.map((item) => (
              <PaginationItem key={item}>
                {typeof item === "number" ? (
                  <PaginationLink
                    type="button"
                    isActive={item === boundedCurrentPage}
                    onClick={() => setCurrentPage(item)}
                  >
                    {item}
                  </PaginationLink>
                ) : (
                  <PaginationEllipsis />
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                type="button"
                disabled={boundedCurrentPage === totalPages}
                onClick={() => setCurrentPage(Math.min(totalPages, boundedCurrentPage + 1))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
};

export default EarningsTable;
