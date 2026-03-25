import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { UserAuth } from "@/features/auth/context/AuthContext";
import { createProject } from "@/features/projects/services/projects";
import { cn } from "@/lib/utils";

const DESCRIPTION_LIMIT = 160;

const pad2 = (value) => String(value).padStart(2, "0");

const formatLocalYmd = (value) => {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

const parseLocalYmd = (value) => {
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

const formatDateLabel = (value) => {
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

const parseBudget = (value) => {
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

const projectSchema = z
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

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { session } = UserAuth();
  const currentYear = new Date().getFullYear();
  const minCalendarYear = currentYear - 36;
  const maxCalendarYear = currentYear + 10;

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      budgetCeiling: "",
      projectType: undefined,
      currency: "USD",
      startDate: "",
      endDate: "",
    },
    mode: "onBlur",
  });

  const descriptionValue = form.watch("description") || "";
  const startDateValue = form.watch("startDate");
  const endDateValue = form.watch("endDate");
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      budgetCeiling: Number(values.budgetCeiling),
      currency: values.currency,
      projectType: values.projectType,
      startDate: new Date(`${values.startDate}T00:00:00`).toISOString(),
      endDate: new Date(`${values.endDate}T00:00:00`).toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await createProject(payload, { userId: session?.user?.id });
      toast.success("Project created successfully");
      if (result?.data?.id) {
        navigate(`/projects/${result.data.id}`);
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.message || "Unable to create project in Supabase. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <SidebarProvider style={{ "--sidebar-width": "260px" }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Create New Project" />
        <div className="flex flex-1 items-center justify-center p-6 md:p-8">
          <Card className="mx-auto w-full max-w-3xl">
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
              <CardDescription>Fill in your project details to get started.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project name" {...field} maxLength={80} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your project"
                            {...field}
                            maxLength={DESCRIPTION_LIMIT}
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription className="flex justify-between">
                          <span>Required</span>
                          <span>
                            {descriptionValue.length}/{DESCRIPTION_LIMIT}
                          </span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="budgetCeiling"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Ceiling</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. 12000"
                              inputMode="decimal"
                              autoComplete="off"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Maximum you can spend on this project</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="projectType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select project type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Music">Music</SelectItem>
                              <SelectItem value="Film">Film</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-between border-input bg-transparent font-normal hover:bg-transparent hover:text-foreground dark:bg-input/30 dark:hover:bg-input/50",
                                    !field.value && "text-muted-foreground"
                                  )}>
                                  {formatDateLabel(field.value)}
                                  <CalendarIcon className="size-4 opacity-70" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start" side="top" avoidCollisions={false}>
                              <Calendar
                                mode="single"
                                selected={field.value ? parseLocalYmd(field.value) ?? undefined : undefined}
                                defaultMonth={field.value ? parseLocalYmd(field.value) ?? new Date() : new Date()}
                                fromYear={minCalendarYear}
                                toYear={maxCalendarYear}
                                initialFocus
                                onSelect={(date) => {
                                  const nextStartDate = formatLocalYmd(date);
                                  field.onChange(nextStartDate);

                                  const currentEndDate = form.getValues("endDate");
                                  if (currentEndDate && nextStartDate && currentEndDate < nextStartDate) {
                                    form.setValue("endDate", "", { shouldValidate: true });
                                  }
                                }}
                                captionLayout="dropdown"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-between border-input bg-transparent font-normal hover:bg-transparent hover:text-foreground dark:bg-input/30 dark:hover:bg-input/50",
                                    !field.value && "text-muted-foreground"
                                  )}>
                                  {formatDateLabel(field.value)}
                                  <CalendarIcon className="size-4 opacity-70" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start" side="top" avoidCollisions={false}>
                              <Calendar
                                mode="single"
                                selected={endDateValue ? parseLocalYmd(endDateValue) ?? undefined : undefined}
                                defaultMonth={
                                  endDateValue
                                    ? parseLocalYmd(endDateValue) ?? new Date(endDateValue)
                                    : startDateValue
                                      ? parseLocalYmd(startDateValue) ?? new Date(startDateValue)
                                      : new Date()
                                }
                                fromYear={minCalendarYear}
                                toYear={maxCalendarYear}
                                initialFocus
                                onSelect={(date) => {
                                  field.onChange(formatLocalYmd(date));
                                }}
                                disabled={(date) => {
                                  if (!startDateValue) {
                                    return false;
                                  }

                                  const minDate = parseLocalYmd(startDateValue) ?? new Date(`${startDateValue}T00:00:00`);
                                  return date < minDate;
                                }}
                                captionLayout="dropdown"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <CardFooter className="px-0 pb-0 pt-2">
                    <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <Button className="bg-linen" type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Project"}
                      </Button>
                    </div>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default CreateProjectPage;
