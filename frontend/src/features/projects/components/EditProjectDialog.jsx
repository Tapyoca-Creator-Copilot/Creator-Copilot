import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateProjectForm } from "@/features/projects/components/CreateProjectForm";
import { formatLocalYmd } from "@/features/projects/forms/dateUtils";
import { projectSchema } from "@/features/projects/forms/createProjectSchema";
import { updateProject } from "@/features/projects/services/projects";

const toFormDate = (value) => formatLocalYmd(value);

export const EditProjectDialog = ({
  open,
  onOpenChange,
  project,
  userId,
  onUpdated,
}) => {
  const currentYear = new Date().getFullYear();
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

  useEffect(() => {
    if (!open || !project) {
      return;
    }

    form.reset({
      name: project.name || "",
      description: project.description || "",
      budgetCeiling: String(project.budgetCeiling ?? ""),
      projectType: project.projectType || undefined,
      currency: project.currency || "USD",
      startDate: toFormDate(project.startDate),
      endDate: toFormDate(project.endDate),
    });
  }, [form, open, project]);

  const handleSubmit = async (values) => {
    if (!project?.id) {
      return;
    }

    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      budgetCeiling: Number(values.budgetCeiling),
      projectType: values.projectType,
      startDate: new Date(`${values.startDate}T00:00:00`).toISOString(),
      endDate: new Date(`${values.endDate}T00:00:00`).toISOString(),
    };

    try {
      const result = await updateProject(project.id, payload, { userId });
      toast.success("Project updated.");
      onOpenChange(false);
      await onUpdated?.(result.data);
    } catch (error) {
      toast.error(error?.message || "Unable to update this project.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project details and timeline used across your dashboard.
          </DialogDescription>
        </DialogHeader>
        <CreateProjectForm
          form={form}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={form.formState.isSubmitting}
          minCalendarYear={currentYear - 36}
          maxCalendarYear={currentYear + 10}
          submitLabel="Save Changes"
          submittingLabel="Saving..."
          canEditCurrency={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;
