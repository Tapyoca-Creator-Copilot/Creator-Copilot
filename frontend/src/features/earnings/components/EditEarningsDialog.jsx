import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EARNING_SOURCE_TYPES } from "@/features/earnings/services/earnings";
import { DESCRIPTION_LIMIT, buildEditDefaultValues, earningSchema, formatDateLabel, formatLocalYmd, parseLocalYmd } from "@/features/earnings/utils/earningsForm";
import { cn } from "@/lib/utils";

const EditEarningsDialog = ({
  open,
  onOpenChange,
  session,
  projects = [],
  selectedProjectId,
  earning,
  onUpdated,
  updateFn,
}) => {
  const currentYear = new Date().getFullYear();
  const minCalendarYear = currentYear - 36;
  const maxCalendarYear = currentYear + 10;

  const defaultValues = useMemo(
    () => buildEditDefaultValues({ earning, selectedProjectId, projects }),
    [earning, projects, selectedProjectId]
  );

  const form = useForm({
    resolver: zodResolver(earningSchema({ sourceTypes: EARNING_SOURCE_TYPES })),
    defaultValues,
    mode: "onBlur",
  });

  const isSubmitting = form.formState.isSubmitting;
  const notesValue = form.watch("description") || "";

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form, open]);

  const handleSubmit = async (values) => {
    if (!earning?.id) {
      toast.error("No earning selected to edit.");
      return;
    }

    try {
      const result = await updateFn(
        earning.id,
        {
          projectId: values.projectId,
          name: values.name,
          amount: Number(values.amount),
          sourceType: values.sourceType,
          description: values.description || null,
          earningDate: values.earningDate,
          contractUrl: values.contractUrl || null,
        },
        { userId: session?.user?.id }
      );

      toast.success("Earning updated");
      onUpdated?.(result?.data);
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to update earning. Please try again.");
    }
  };

  const projectOptions = projects || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Earning</DialogTitle>
          <DialogDescription>Update this income record for the selected project.</DialogDescription>
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
                      <SelectContent align="start">
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
                    <FormLabel>Earning Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Summer Tour Night 1"
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
                        placeholder="e.g. 2500.00"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Enter the total earned for this item.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent align="start">
                        {EARNING_SOURCE_TYPES.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
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
                name="earningDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Earning Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-between font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
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
                name="contractUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract / Invoice URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional. File uploads coming soon.</FormDescription>
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
                        placeholder="Add context for this earning"
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
                onClick={() => onOpenChange?.(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || projectOptions.length === 0}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEarningsDialog;
