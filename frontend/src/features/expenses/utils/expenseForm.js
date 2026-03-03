import { z } from "zod";

export const DESCRIPTION_LIMIT = 200;

const pad2 = (value) => String(value).padStart(2, "0");

export const formatLocalYmd = (value) => {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

export const parseLocalYmd = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const parts = value.split("-").map((part) => Number(part));
  if (parts.length !== 3) {
    return null;
  }

  const [year, month, day] = parts;
  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

export const formatDateLabel = (value) => {
  if (!value) {
    return "Pick a date";
  }

  const date = value instanceof Date ? value : parseLocalYmd(value) || new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Pick a date";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const parseAmount = (value) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return NaN;
  }

  const normalized = value.replace(/[$,\s]/g, "").trim();
  if (!normalized) {
    return NaN;
  }

  return Number(normalized);
};

export const expenseSchema = ({ departments }) =>
  z.object({
    projectId: z.string().uuid({ message: "Project is required" }),
    name: z
      .string()
      .trim()
      .min(2, "Expense title must be at least 2 characters")
      .max(120, "Expense title cannot exceed 120 characters"),
    amount: z.preprocess(
      parseAmount,
      z.number({ message: "Amount must be a number" }).positive("Amount must be greater than 0")
    ),
    department: z
      .string()
      .min(1, "Department is required")
      .refine((value) => (departments || []).includes(value), "Department is required"),
    category: z.string().trim().max(80, "Category cannot exceed 80 characters").optional().or(z.literal("")),
    vendor: z.string().trim().max(120, "Vendor cannot exceed 120 characters").optional().or(z.literal("")),
    receiptUrl: z
      .string()
      .trim()
      .url("Receipt URL must be a valid URL")
      .optional()
      .or(z.literal("")),
    description: z
      .string()
      .trim()
      .max(DESCRIPTION_LIMIT, `Notes cannot exceed ${DESCRIPTION_LIMIT} characters`)
      .optional()
      .or(z.literal("")),
    expenseDate: z.string().min(1, "Expense date is required"),
  });

export const buildAddDefaultValues = ({ selectedProjectId, projects }) => {
  const fallbackProjectId = selectedProjectId || projects?.[0]?.id || "";
  const yyyyMmDd = formatLocalYmd(new Date());

  return {
    projectId: fallbackProjectId,
    name: "",
    amount: "",
    department: "",
    category: "",
    description: "",
    expenseDate: yyyyMmDd,
    vendor: "",
    receiptUrl: "",
  };
};

export const buildEditDefaultValues = ({ expense, selectedProjectId, projects }) => {
  if (!expense) {
    return buildAddDefaultValues({ selectedProjectId, projects });
  }

  return {
    projectId: expense.projectId || selectedProjectId || projects?.[0]?.id || "",
    name: expense.name || "",
    amount: expense.amount === 0 ? "0" : expense.amount ? String(expense.amount) : "",
    department: expense.department || "",
    category: expense.category || "",
    description: expense.description || "",
    expenseDate: expense.expenseDate || formatLocalYmd(new Date()),
    vendor: expense.vendor || "",
    receiptUrl: expense.receiptUrl || "",
  };
};
