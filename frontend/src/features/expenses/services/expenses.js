import { apiFetch, apiFetchResponse } from "@/lib/apiClient";

export const EXPENSE_DEPARTMENTS = [
  "Marketing",
  "Equipment",
  "Labor",
  "Studio / Venue",
  "Wardrobe / Styling",
  "Editing / Post",
  "Software",
  "Travel",
  "Food",
  "Distribution",
  "Merch",
  "Other",
];

export const resolveExpenseDepartmentFilterValue = (department) => {
  const value = typeof department === "string" ? department.trim() : "";
  if (!value) {
    return "Other";
  }

  return EXPENSE_DEPARTMENTS.includes(value) ? value : "Other";
};

export const normalizeExpense = (expense) => {
  if (!expense) {
    return null;
  }

  return {
    id: expense.id,
    userId: expense.userId,
    projectId: expense.projectId,
    name: expense.name,
    amount: Number(expense.amount ?? 0),
    department: resolveExpenseDepartmentFilterValue(expense.department),
    category: expense.category ?? null,
    description: expense.description ?? null,
    expenseDate: expense.expenseDate,
    vendor: expense.vendor ?? null,
    receiptUrl: expense.receiptUrl ?? null,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
    project: expense.project ?? null,
  };
};

export const createExpense = async (payload, options = {}) => {
  if (!options.userId && !payload.userId) {
    throw new Error("You must be signed in to add an expense.");
  }

  if (!payload.projectId) {
    throw new Error("Project is required to add an expense.");
  }

  const body = await apiFetch(`/api/projects/${payload.projectId}/expenses`, {
    method: "POST",
    body: JSON.stringify({
      name: payload.name?.trim() || "",
      amount: payload.amount,
      department: payload.department,
      category: payload.category?.trim() || null,
      description: payload.description?.trim() || null,
      expenseDate: payload.expenseDate,
      vendor: payload.vendor?.trim() || null,
      receiptUrl: payload.receiptUrl?.trim() || null,
    }),
  });

  return {
    data: normalizeExpense(body.data),
    source: "api",
  };
};

export const getExpenses = async (options = {}) => {
  if (!options.userId) {
    throw new Error("You must be signed in to view expenses.");
  }

  if (!options.projectId) {
    return { data: [], source: "api" };
  }

  const params = new URLSearchParams();
  if (options.department && options.department !== "all") {
    params.set("department", options.department);
  }

  const qs = params.toString();
  const path = `/api/projects/${options.projectId}/expenses${qs ? `?${qs}` : ""}`;

  const body = await apiFetch(path);

  return {
    data: (body.data || []).map(normalizeExpense).filter(Boolean),
    source: "api",
  };
};

export const updateExpense = async (expenseId, payload, options = {}) => {
  const userId = options.userId ?? payload?.userId;

  if (!userId) {
    throw new Error("You must be signed in to update an expense.");
  }

  if (!expenseId) {
    throw new Error("Expense ID is required to update an expense.");
  }

  const projectId = payload.projectId || options.projectId;
  if (!projectId) {
    throw new Error("Project ID is required to update an expense.");
  }

  const body = await apiFetch(`/api/projects/${projectId}/expenses/${expenseId}`, {
    method: "PUT",
    body: JSON.stringify({
      name: payload.name,
      amount: payload.amount,
      department: payload.department,
      category: payload.category,
      description: payload.description,
      expenseDate: payload.expenseDate,
      vendor: payload.vendor,
      receiptUrl: payload.receiptUrl,
      projectId: payload.projectId,
    }),
  });

  return {
    data: normalizeExpense(body.data),
    source: "api",
  };
};

export const deleteExpense = async (expenseId, options = {}) => {
  if (!options.userId) {
    throw new Error("You must be signed in to delete an expense.");
  }

  if (!expenseId) {
    throw new Error("Expense ID is required to delete an expense.");
  }

  if (!options.projectId) {
    throw new Error("Project ID is required to delete an expense.");
  }

  await apiFetch(`/api/projects/${options.projectId}/expenses/${expenseId}`, {
    method: "DELETE",
  });

  return {
    data: { id: expenseId },
    source: "api",
  };
};

export const getBudgetSummary = async (projectId) => {
  const body = await apiFetch(`/api/projects/${projectId}/budget-summary`);
  return body.data;
};

const getFilenameFromDisposition = (disposition) => {
  if (!disposition || typeof disposition !== "string") {
    return null;
  }

  const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  const raw = match?.[1] || match?.[2];
  if (!raw) {
    return null;
  }

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

export const exportProjectExpensesCsv = async (projectId, options = {}) => {
  if (!options.userId) {
    throw new Error("You must be signed in to export expenses.");
  }

  if (!projectId) {
    throw new Error("Project ID is required to export expenses.");
  }

  const res = await apiFetchResponse(`/api/projects/${projectId}/expenses/export`, {
    method: "GET",
  });

  const blob = await res.blob();
  const filename =
    getFilenameFromDisposition(res.headers.get("content-disposition")) ||
    `expenses_${projectId}.csv`;

  return { blob, filename };
};

export const importExpensesCsv = async (projectId, file, columnMapping, options = {}) => {
  if (!options.userId) {
    throw new Error("You must be signed in to import expenses.");
  }

  if (!projectId) {
    throw new Error("Project ID is required to import expenses.");
  }

  if (!file) {
    throw new Error("A CSV file is required to import expenses.");
  }

  if (!columnMapping || typeof columnMapping !== "object" || Array.isArray(columnMapping)) {
    throw new Error("A valid column mapping is required to import expenses.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("mapping", JSON.stringify(columnMapping));

  const body = await apiFetch(`/api/projects/${projectId}/expenses/import`, {
    method: "POST",
    body: form,
  });

  return {
    data: body.data,
    source: "api",
  };
};
