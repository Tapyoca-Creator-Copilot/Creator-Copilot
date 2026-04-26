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

export const earningSchema = ({ sourceTypes }) =>
  z.object({
    projectId: z.string().uuid({ message: "Project is required" }),
    name: z
      .string()
      .trim()
      .min(2, "Earning title must be at least 2 characters")
      .max(120, "Earning title cannot exceed 120 characters"),
    amount: z.preprocess(
      parseAmount,
      z.number({ message: "Amount must be a number" }).positive("Amount must be greater than 0")
    ),
    sourceType: z
      .string()
      .min(1, "Source type is required")
      .refine((value) => (sourceTypes || []).includes(value), "Source type is required"),
    contractUrl: z
      .string()
      .trim()
      .url("Contract URL must be a valid URL")
      .optional()
      .or(z.literal("")),
    description: z
      .string()
      .trim()
      .max(DESCRIPTION_LIMIT, `Notes cannot exceed ${DESCRIPTION_LIMIT} characters`)
      .optional()
      .or(z.literal("")),
    earningDate: z.string().min(1, "Earning date is required"),
  });

export const buildAddDefaultValues = ({ selectedProjectId, projects }) => {
  const fallbackProjectId = selectedProjectId || projects?.[0]?.id || "";
  const yyyyMmDd = formatLocalYmd(new Date());

  return {
    projectId: fallbackProjectId,
    name: "",
    amount: "",
    sourceType: "",
    contractUrl: "",
    description: "",
    earningDate: yyyyMmDd,
  };
};

export const buildEditDefaultValues = ({ earning, selectedProjectId, projects }) => {
  if (!earning) {
    return buildAddDefaultValues({ selectedProjectId, projects });
  }

  return {
    projectId: earning.projectId || selectedProjectId || projects?.[0]?.id || "",
    name: earning.name || "",
    amount: earning.amount === 0 ? "0" : earning.amount ? String(earning.amount) : "",
    sourceType: earning.sourceType || "",
    contractUrl: earning.contractUrl || "",
    description: earning.description || "",
    earningDate: earning.earningDate || formatLocalYmd(new Date()),
  };
};
