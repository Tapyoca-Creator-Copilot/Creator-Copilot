import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EXPENSE_DEPARTMENTS, createExpense } from "@/features/expenses/services/expenses";
import { DESCRIPTION_LIMIT, buildAddDefaultValues, expenseSchema, formatDateLabel, formatLocalYmd, parseLocalYmd, } from "@/features/expenses/utils/expenseForm";
import { cn } from "@/lib/utils";

const AddExpenseDialog = ({
  open,
  onOpenChange,
  session,
  projects = [],
  selectedProjectId,
  onCreated,
}) => {
  const currentYear = new Date().getFullYear();
  const minCalendarYear = currentYear - 36;
  const maxCalendarYear = currentYear + 10;

  const defaultValues = useMemo(
    () => buildAddDefaultValues({ selectedProjectId, projects }),
    [projects, selectedProjectId]
  );

  const form = useForm({
    resolver: zodResolver(expenseSchema({ departments: EXPENSE_DEPARTMENTS })),
    defaultValues,
    mode: "onBlur",
  });

  const isSubmitting = form.formState.isSubmitting;
  const notesValue = form.watch("description") || "";

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
      return;
    }

    // When opening, prefer the currently selected project.
    if (selectedProjectId) {
      form.setValue("projectId", selectedProjectId, { shouldValidate: true });
    }
  }, [defaultValues, form, open, selectedProjectId]);

  const handleSubmit = async (values) => {
    try {
      const result = await createExpense(
        {
          projectId: values.projectId,
          name: values.name,
          amount: Number(values.amount),
          department: values.department,
          category: values.category || null,
          description: values.description || null,
          expenseDate: values.expenseDate,
          vendor: values.vendor || null,
          receiptUrl: values.receiptUrl || null,
        },
        { userId: session?.user?.id }
      );

      toast.success("Expense added");
      onCreated?.(result?.data);
      onOpenChange?.(false);
      form.reset(buildAddDefaultValues({ selectedProjectId, projects }));
    } catch (error) {
      toast.error(error?.message || "Unable to add expense. Please try again.");
    }
  };

  const projectOptions = projects || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-linen dark:bg-card">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Log a transaction for the selected project. Fields marked required help keep reporting accurate.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" noValidate>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Project</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={projectOptions.length ? "Select a project" : "No projects found"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent align="start" className="bg-linen">
                        {projectOptions.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Expense Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Location scout deposit"
                        {...field}
                        maxLength={120}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="decimal"
                        placeholder="e.g. 245.50"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Enter the total paid for this item.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent align="start" className="bg-linen">
                        {EXPENSE_DEPARTMENTS.map((department) => (
                          <SelectItem key={department} value={department}>
                            {department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expenseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-between border-input bg-linen font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {formatDateLabel(field.value)}
                            <CalendarIcon className="size-4 opacity-70" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-linen" align="start" side="top" avoidCollisions={false}>
                        <Calendar
                          mode="single"
                          selected={field.value ? parseLocalYmd(field.value) ?? undefined : undefined}
                          defaultMonth={field.value ? parseLocalYmd(field.value) ?? new Date() : new Date()}
                          fromYear={minCalendarYear}
                          toYear={maxCalendarYear}
                          initialFocus
                          onSelect={(date) => {
                            field.onChange(formatLocalYmd(date));
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
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor / Payee</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. B&H Photo"
                        {...field}
                        maxLength={120}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional category"
                        {...field}
                        maxLength={80}
                      />
                    </FormControl>
                    <FormDescription>Optional. Separate from department if you want.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receiptUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receipt URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional. File uploads can be added later.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add context for this expense"
                        rows={4}
                        maxLength={DESCRIPTION_LIMIT}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between">
                      <span>Optional</span>
                      <span>
                        {notesValue.length}/{DESCRIPTION_LIMIT}
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="bg-linen hover:bg-linen-hover"
                onClick={() => onOpenChange?.(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || projectOptions.length === 0}>
                {isSubmitting ? "Saving..." : "Add Expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;
