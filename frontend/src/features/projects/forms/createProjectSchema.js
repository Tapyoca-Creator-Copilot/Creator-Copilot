import { z } from "zod";

export const DESCRIPTION_LIMIT = 160;

export const parseBudget = (value) => {
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

export const projectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Project name must be at least 2 characters")
      .max(80, "Project name cannot exceed 80 characters"),
    description: z
      .string()
      .trim()
      .min(1, "Project description is required")
      .max(DESCRIPTION_LIMIT, `Description cannot exceed ${DESCRIPTION_LIMIT} characters`),
    budgetCeiling: z.preprocess(
      parseBudget,
      z.number({ message: "Budget ceiling must be a number" }).positive("Budget ceiling must be greater than 0")
    ),
    projectType: z.enum(["Music", "Film"], {
      message: "Project type is required",
    }),
    currency: z.enum(["USD", "EUR", "GBP"], {
      message: "Currency is required",
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "Estimated end date is required"),
  })
  .superRefine((data, ctx) => {
    if (!data.startDate || !data.endDate) {
      return;
    }

    const start = new Date(`${data.startDate}T00:00:00`);
    const end = new Date(`${data.endDate}T00:00:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return;
    }

    if (end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Estimated end date cannot be before start date",
        path: ["endDate"],
      });
    }
  });
