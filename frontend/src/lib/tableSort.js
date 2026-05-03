export const SORT_DIRECTIONS = {
  asc: "asc",
  desc: "desc",
};

export const toggleSortDirection = (direction) =>
  direction === SORT_DIRECTIONS.asc ? SORT_DIRECTIONS.desc : SORT_DIRECTIONS.asc;

export const getNextSortState = (
  currentKey,
  currentDirection,
  nextKey,
  defaultDirections = {}
) => {
  if (currentKey === nextKey) {
    return {
      sortKey: nextKey,
      sortDirection: toggleSortDirection(currentDirection || defaultDirections[nextKey] || "asc"),
    };
  }

  return {
    sortKey: nextKey,
    sortDirection: defaultDirections[nextKey] || "asc",
  };
};

const isNil = (value) => value === null || value === undefined;

const normalizeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeDate = (value) => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
};

const normalizeText = (value) => {
  if (isNil(value)) return "";
  return String(value).trim();
};

export const sortRows = (rows, { sortKey, sortDirection, sortConfig }) => {
  if (!Array.isArray(rows) || rows.length < 2) return rows || [];
  if (!sortKey || !sortConfig?.[sortKey]) return rows;

  const { type, getValue } = sortConfig[sortKey];
  if (typeof getValue !== "function") return rows;

  const directionMultiplier = sortDirection === SORT_DIRECTIONS.desc ? -1 : 1;

  const collator = new Intl.Collator(undefined, {
    sensitivity: "base",
    numeric: true,
  });

  const withIndex = rows.map((row, index) => ({ row, index }));

  withIndex.sort((a, b) => {
    const aRaw = getValue(a.row);
    const bRaw = getValue(b.row);

    let aValue;
    let bValue;

    if (type === "number") {
      aValue = normalizeNumber(aRaw);
      bValue = normalizeNumber(bRaw);
    } else if (type === "date") {
      aValue = normalizeDate(aRaw);
      bValue = normalizeDate(bRaw);
    } else {
      aValue = normalizeText(aRaw);
      bValue = normalizeText(bRaw);
    }

    const aIsEmpty = aValue === null || aValue === "";
    const bIsEmpty = bValue === null || bValue === "";

    if (aIsEmpty && bIsEmpty) {
      return a.index - b.index;
    }

    if (aIsEmpty) return 1;
    if (bIsEmpty) return -1;

    let result = 0;

    if (type === "number" || type === "date") {
      result = aValue - bValue;
    } else {
      result = collator.compare(aValue, bValue);
    }

    if (result === 0) {
      return a.index - b.index;
    }

    return result * directionMultiplier;
  });

  return withIndex.map((item) => item.row);
};
