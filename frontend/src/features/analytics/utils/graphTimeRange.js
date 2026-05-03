export const GRAPH_TIME_RANGE_OPTIONS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const endOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

const addDays = (date, amount) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

const formatDayLabel = (date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const formatWeekLabel = (start, end) => `${formatDayLabel(start)} - ${formatDayLabel(end)}`;

const formatMonthLabel = (date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });

const parseDateLike = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string") {
    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getExpenseDate = (expense) => {
  return (
    parseDateLike(expense?.expenseDate) ||
    parseDateLike(expense?.expense_date) ||
    parseDateLike(expense?.date)
  );
};

const getMinExpenseDate = (expenses) => {
  let minDate = null;

  (expenses || []).forEach((expense) => {
    const expenseDate = getExpenseDate(expense);
    if (!expenseDate) {
      return;
    }

    if (!minDate || expenseDate < minDate) {
      minDate = expenseDate;
    }
  });

  return minDate;
};

const getMaxExpenseDate = (expenses) => {
  let maxDate = null;

  (expenses || []).forEach((expense) => {
    const expenseDate = getExpenseDate(expense);
    if (!expenseDate) {
      return;
    }

    if (!maxDate || expenseDate > maxDate) {
      maxDate = expenseDate;
    }
  });

  return maxDate;
};

const getValidDate = (value) => {
  return parseDateLike(value);
};

const resolveProjectRangeBounds = (expenses, options = {}) => {
  const startFromProject = getValidDate(options.projectStartDate);
  const endFromProject = getValidDate(options.projectEndDate);
  const minExpenseDate = getMinExpenseDate(expenses);
  const maxExpenseDate = getMaxExpenseDate(expenses);

  const hasProjectBounds = Boolean(startFromProject && endFromProject);

  // Primary: project timeline bounds when valid.
  let rawStart = startFromProject || minExpenseDate || maxExpenseDate;
  let rawEnd = endFromProject || maxExpenseDate || minExpenseDate;

  if (!rawStart || !rawEnd) {
    return null;
  }

  // Safety fallback: if project range has no overlap with real expenses,
  // prefer expense-derived bounds to avoid false-empty charts from bad project dates.
  if (hasProjectBounds && minExpenseDate && maxExpenseDate) {
    const projectStart = startFromProject <= endFromProject ? startFromProject : endFromProject;
    const projectEnd = startFromProject <= endFromProject ? endFromProject : startFromProject;
    const overlapsExpenses = projectStart <= maxExpenseDate && projectEnd >= minExpenseDate;

    if (!overlapsExpenses) {
      rawStart = minExpenseDate;
      rawEnd = maxExpenseDate;
    }
  }

  const normalizedStart = startOfDay(rawStart <= rawEnd ? rawStart : rawEnd);
  const normalizedEnd = endOfDay(rawStart <= rawEnd ? rawEnd : rawStart);

  return {
    startDate: normalizedStart,
    endDate: normalizedEnd,
  };
};

const getMonthIntervalEnd = (date) =>
  endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));

const buildBuckets = (timeRange, startDate, endDate) => {
  const buckets = [];

  if (timeRange === "day") {
    let cursor = startOfDay(startDate);
    while (cursor <= endDate) {
      const bucketStart = startOfDay(cursor);
      const bucketEnd = endOfDay(cursor);
      buckets.push({
        key: bucketStart.toISOString(),
        start: bucketStart,
        end: bucketEnd,
        label: formatDayLabel(bucketStart),
      });
      cursor = addDays(cursor, 1);
    }

    return buckets;
  }

  if (timeRange === "week") {
    let cursor = startOfDay(startDate);
    while (cursor <= endDate) {
      const bucketStart = startOfDay(cursor);
      const candidateEnd = endOfDay(addDays(bucketStart, 6));
      const bucketEnd = candidateEnd > endDate ? endDate : candidateEnd;
      buckets.push({
        key: bucketStart.toISOString(),
        start: bucketStart,
        end: bucketEnd,
        label: formatWeekLabel(bucketStart, bucketEnd),
      });
      cursor = addDays(bucketStart, 7);
    }

    return buckets;
  }

  let cursor = startOfDay(startDate);
  while (cursor <= endDate) {
    const bucketStart = startOfDay(cursor);
    const candidateEnd = getMonthIntervalEnd(bucketStart);
    const bucketEnd = candidateEnd > endDate ? endDate : candidateEnd;
    buckets.push({
      key: `${bucketStart.getFullYear()}-${String(bucketStart.getMonth() + 1).padStart(2, "0")}`,
      start: bucketStart,
      end: bucketEnd,
      label: formatMonthLabel(bucketStart),
    });
    cursor = new Date(bucketStart.getFullYear(), bucketStart.getMonth() + 1, 1);
  }

  return buckets;
};

const getBucketKeyFromExpenseDate = (timeRange, expenseDate, projectStartDate) => {
  if (timeRange === "day") {
    return startOfDay(expenseDate).toISOString();
  }

  if (timeRange === "week") {
    const diffInDays = Math.floor(
      (startOfDay(expenseDate).getTime() - startOfDay(projectStartDate).getTime()) / (24 * 60 * 60 * 1000)
    );
    const weekIndex = Math.floor(diffInDays / 7);
    return addDays(startOfDay(projectStartDate), weekIndex * 7).toISOString();
  }

  return `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, "0")}`;
};

export const filterExpensesByTimeRange = (expenses, timeRange, options = {}) => {
  const bounds = resolveProjectRangeBounds(expenses, options);
  if (!bounds) {
    return [];
  }

  const { startDate, endDate } = bounds;

  return (expenses || []).filter((expense) => {
    const expenseDate = getExpenseDate(expense);
    return expenseDate && expenseDate >= startDate && expenseDate <= endDate;
  });
};

export const buildExpenseTrendData = (expenses, timeRange, options = {}) => {
  const bounds = resolveProjectRangeBounds(expenses, options);
  if (!bounds) {
    return [];
  }

  const { startDate, endDate } = bounds;
  const buckets = buildBuckets(timeRange, startDate, endDate);
  const bucketTotals = new Map();

  (expenses || []).forEach((expense) => {
    const expenseDate = getExpenseDate(expense);
    if (!expenseDate || expenseDate < startDate || expenseDate > endDate) {
      return;
    }

    const bucketKey = getBucketKeyFromExpenseDate(timeRange, expenseDate, startDate);
    const currentTotal = bucketTotals.get(bucketKey) || 0;
    bucketTotals.set(bucketKey, currentTotal + Number(expense?.amount || 0));
  });

  return buckets.map((bucket) => ({
      date: bucket.label,
      amount: Number((bucketTotals.get(bucket.key) || 0).toFixed(2)),
  }));
};

export const getTimeRangeLabel = (timeRange) => {
  const option = GRAPH_TIME_RANGE_OPTIONS.find((item) => item.value === timeRange);
  return option?.label || "Month";
};

export const buildEarningTrendData = (earnings, timeRange, options = {}) => {
  const earningsAsExpenses = (earnings || []).map((e) => ({
    expenseDate: e?.earningDate,
    amount: e?.amount,
  }));

  const bounds = resolveProjectRangeBounds(earningsAsExpenses, options);
  if (!bounds) return [];

  const { startDate, endDate } = bounds;
  const buckets = buildBuckets(timeRange, startDate, endDate);
  const bucketTotals = new Map();

  (earnings || []).forEach((earning) => {
    const date = parseDateLike(earning?.earningDate);
    if (!date || date < startDate || date > endDate) return;
    const key = getBucketKeyFromExpenseDate(timeRange, date, startDate);
    bucketTotals.set(key, (bucketTotals.get(key) || 0) + Number(earning?.amount || 0));
  });

  return buckets.map((bucket) => ({
    date: bucket.label,
    amount: Number((bucketTotals.get(bucket.key) || 0).toFixed(2)),
  }));
};

export const buildProfitTrendData = (earnings, expenses, timeRange, options = {}) => {
  // Map earnings to expense-shaped items so resolveProjectRangeBounds can handle both
  const earningsAsItems = (earnings || []).map((e) => ({
    expenseDate: e?.earningDate,
    amount: e?.amount,
  }));

  const combined = [...earningsAsItems, ...(expenses || [])];
  const bounds = resolveProjectRangeBounds(combined, options);
  if (!bounds) return [];

  const { startDate, endDate } = bounds;
  const buckets = buildBuckets(timeRange, startDate, endDate);

  const earningBuckets = new Map();
  const expenseBuckets = new Map();

  (earnings || []).forEach((earning) => {
    const date = parseDateLike(earning?.earningDate);
    if (!date || date < startDate || date > endDate) return;
    const key = getBucketKeyFromExpenseDate(timeRange, date, startDate);
    earningBuckets.set(key, (earningBuckets.get(key) || 0) + Number(earning?.amount || 0));
  });

  (expenses || []).forEach((expense) => {
    const date = getExpenseDate(expense);
    if (!date || date < startDate || date > endDate) return;
    const key = getBucketKeyFromExpenseDate(timeRange, date, startDate);
    expenseBuckets.set(key, (expenseBuckets.get(key) || 0) + Number(expense?.amount || 0));
  });

  return buckets.map((bucket) => ({
    date: bucket.label,
    earnings: Number((earningBuckets.get(bucket.key) || 0).toFixed(2)),
    expenses: Number((expenseBuckets.get(bucket.key) || 0).toFixed(2)),
    profit: Number(
      ((earningBuckets.get(bucket.key) || 0) - (expenseBuckets.get(bucket.key) || 0)).toFixed(2)
    ),
  }));
};
