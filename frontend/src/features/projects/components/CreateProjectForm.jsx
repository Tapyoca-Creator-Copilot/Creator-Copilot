import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CardFooter } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { DESCRIPTION_LIMIT } from "@/features/projects/forms/createProjectSchema";
import { formatDateLabel, formatLocalYmd, parseLocalYmd } from "@/features/projects/forms/dateUtils";

export const CreateProjectForm = ({
  form,
  onSubmit,
  onCancel,
  isSubmitting,
  minCalendarYear,
  maxCalendarYear,
}) => {
  const descriptionValue = form.watch("description") || "";
  const startDateValue = form.watch("startDate");
  const endDateValue = form.watch("endDate");

  return (
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
            <Button
              
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Form>
  );
};
