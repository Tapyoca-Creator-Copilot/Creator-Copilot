import { supabase } from "@/supabaseClient";

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

const normalizeProjectMini = (project) => {
  if (!project) {
    return null;
  }

  return {
    id: project.id,
    name: project.name,
    currency: project.currency,
  };
};

export const normalizeExpense = (expense) => {
  if (!expense) {
    return null;
  }

  return {
    id: expense.id,
    userId: expense.userId ?? expense.user_id,
    projectId: expense.projectId ?? expense.project_id,
    name: expense.name,
    amount: Number(expense.amount ?? 0),
    department: expense.department,
    category: expense.category ?? null,
    description: expense.description ?? null,
    expenseDate: expense.expenseDate ?? expense.expense_date,
    vendor: expense.vendor ?? null,
    receiptUrl: expense.receiptUrl ?? expense.receipt_url ?? null,
    createdAt: expense.createdAt ?? expense.created_at,
    updatedAt: expense.updatedAt ?? expense.updated_at,
    project: normalizeProjectMini(expense.project ?? expense.projects),
  };
};

export const createExpense = async (payload, options = {}) => {
  if (!options.userId && !payload.userId) {
    throw new Error("You must be signed in to add an expense.");
  }

  const userId = options.userId ?? payload.userId;
  if (!payload.projectId) {
    throw new Error("Project is required to add an expense.");
  }

  const expenseToCreate = {
    userId,
    projectId: payload.projectId,
    name: payload.name?.trim() || "",
    amount: payload.amount,
    department: payload.department,
    category: payload.category?.trim() || null,
    description: payload.description?.trim() || null,
    expenseDate: payload.expenseDate,
    vendor: payload.vendor?.trim() || null,
    receiptUrl: payload.receiptUrl?.trim() || null,
  };

  const { data, error } = await supabase
    .from("expenses")
    .insert([
      {
        user_id: expenseToCreate.userId,
        project_id: expenseToCreate.projectId,
        name: expenseToCreate.name,
        amount: expenseToCreate.amount,
        department: expenseToCreate.department,
        category: expenseToCreate.category,
        description: expenseToCreate.description,
        expense_date: expenseToCreate.expenseDate,
        vendor: expenseToCreate.vendor,
        receipt_url: expenseToCreate.receiptUrl,
      },
    ])
    .select(
      "id, user_id, project_id, name, amount, department, category, description, expense_date, vendor, receipt_url, created_at, updated_at"
    )
    .single();

  if (error) {
    throw error;
  }

  return {
    data: normalizeExpense(data),
    source: "supabase",
  };
};

export const getExpenses = async (options = {}) => {
  if (!options.userId) {
    throw new Error("You must be signed in to view expenses.");
  }

  if (!options.projectId) {
    return {
      data: [],
      source: "supabase",
    };
  }

  let query = supabase
    .from("expenses")
    .select(
      "id, user_id, project_id, name, amount, department, category, description, expense_date, vendor, receipt_url, created_at, updated_at, projects ( id, name, currency )"
    )
    .eq("user_id", options.userId)
    .eq("project_id", options.projectId)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (options.department && options.department !== "all") {
    query = query.eq("department", options.department);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return {
    data: (data || []).map((row) => normalizeExpense(row)).filter(Boolean),
    source: "supabase",
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

  const updatePatch = {};

  if (Object.prototype.hasOwnProperty.call(payload, "name")) {
    updatePatch.name = payload.name?.trim() || "";
  }
  if (Object.prototype.hasOwnProperty.call(payload, "amount")) {
    updatePatch.amount = payload.amount;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "department")) {
    updatePatch.department = payload.department;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "category")) {
    updatePatch.category = payload.category?.trim() || null;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "description")) {
    updatePatch.description = payload.description?.trim() || null;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "expenseDate")) {
    updatePatch.expense_date = payload.expenseDate;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "vendor")) {
    updatePatch.vendor = payload.vendor?.trim() || null;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "receiptUrl")) {
    updatePatch.receipt_url = payload.receiptUrl?.trim() || null;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "projectId")) {
    updatePatch.project_id = payload.projectId;
  }

  const { data, error } = await supabase
    .from("expenses")
    .update(updatePatch)
    .eq("id", expenseId)
    .eq("user_id", userId)
    .select(
      "id, user_id, project_id, name, amount, department, category, description, expense_date, vendor, receipt_url, created_at, updated_at, projects ( id, name, currency )"
    )
    .single();

  if (error) {
    throw error;
  }

  return {
    data: normalizeExpense(data),
    source: "supabase",
  };
};

export const deleteExpense = async (expenseId, options = {}) => {
  if (!options.userId) {
    throw new Error("You must be signed in to delete an expense.");
  }

  if (!expenseId) {
    throw new Error("Expense ID is required to delete an expense.");
  }

  const { data, error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId)
    .eq("user_id", options.userId)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return {
    data: data ? { id: data.id } : null,
    source: "supabase",
  };
};

