import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserAuth } from "@/features/auth/context/AuthContext";
import { CreateProjectForm } from "@/features/projects/components/CreateProjectForm";
import { projectSchema } from "@/features/projects/forms/createProjectSchema";
import { createProject } from "@/features/projects/services/projects";

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
              <CreateProjectForm
                form={form}
                onSubmit={onSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                minCalendarYear={minCalendarYear}
                maxCalendarYear={maxCalendarYear}
              />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default CreateProjectPage;
