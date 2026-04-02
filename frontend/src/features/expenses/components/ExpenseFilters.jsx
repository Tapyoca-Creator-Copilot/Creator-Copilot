
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EXPENSE_DEPARTMENTS } from "@/features/expenses/services/expenses";

const ExpenseFilters = ({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  disabled,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-full md:max-w-sm">
        <Input
          value={search}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder="Search expenses (name, vendor, notes, department)"
          disabled={disabled}
        />
      </div>

      <div className="w-full overflow-x-auto">
        <div className="flex w-max items-center gap-2 py-1">
          <Badge
            asChild
            variant={department === "all" ? "default" : "secondary"}
            className="rounded-full px-4 py-1 text-sm">
            <button
              type="button"
              aria-label="All departments"
              aria-pressed={department === "all"}
              disabled={disabled}
              onClick={() => onDepartmentChange?.("all")}>
              All
            </button>
          </Badge>
          {EXPENSE_DEPARTMENTS.map((item) => (
            <Badge
              key={item}
              asChild
              variant={department === item ? "default" : "secondary"}
              className="rounded-full px-4 py-1 text-sm">
              <button
                type="button"
                aria-label={`${item} department`}
                aria-pressed={department === item}
                disabled={disabled}
                onClick={() => onDepartmentChange?.(item)}>
                {item}
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilters;
