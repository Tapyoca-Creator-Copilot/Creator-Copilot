import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EARNING_SOURCE_TYPES } from "@/features/earnings/services/earnings";

const EarningsFilters = ({
  search,
  onSearchChange,
  sourceType,
  onSourceTypeChange,
  disabled,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-full md:max-w-sm">
        <Input
          value={search}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder="Search earnings (name, source, notes)"
          disabled={disabled}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 py-1">
        <Badge
          asChild
          variant={sourceType === "all" ? "default" : "secondary"}
          className="rounded-full px-4 py-1 text-sm">
          <button
            type="button"
            aria-label="All sources"
            aria-pressed={sourceType === "all"}
            disabled={disabled}
            onClick={() => onSourceTypeChange?.("all")}>
            All
          </button>
        </Badge>
        {EARNING_SOURCE_TYPES.map((item) => (
          <Badge
            key={item}
            asChild
            variant={sourceType === item ? "default" : "secondary"}
            className="rounded-full px-4 py-1 text-sm">
            <button
              type="button"
              aria-label={`${item} source`}
              aria-pressed={sourceType === item}
              disabled={disabled}
              onClick={() => onSourceTypeChange?.(item)}>
              {item}
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default EarningsFilters;
