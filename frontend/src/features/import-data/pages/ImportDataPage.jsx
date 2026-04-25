import { Link } from "react-router-dom";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAuth } from "@/features/auth/context/AuthContext";
import { importEarningsCsv } from "@/features/earnings/services/earnings";
import { importExpensesCsv } from "@/features/expenses/services/expenses";
import ImportSection from "@/features/import-data/components/ImportSection";
import { EARNING_FIELD_CONFIG } from "@/features/import-data/constants/earningFieldConfig";
import { EXPENSE_FIELD_CONFIG } from "@/features/import-data/constants/expenseFieldConfig";
import { useActiveProject } from "@/features/projects/hooks/useActiveProject";

const ImportDataPage = () => {
  const { session } = UserAuth();
  const { activeProject: selectedProject, isLoadingProjects } = useActiveProject();

  return (
    <SidebarProvider style={{ "--sidebar-width": "260px" }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Import Data" />
        <div className="p-6 md:p-8">
          <div className="mx-auto grid w-full max-w-full gap-6 lg:items-start">

            <Tabs defaultValue="earnings">
              <Card className="border-black/5 dark:border-white/10">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle>Active Project</CardTitle>
                    <CardDescription>
                      {isLoadingProjects
                        ? "Loading your projects..."
                        : selectedProject
                          ? "Imports will use the globally selected project from the header."
                          : "Create a project to start importing data."}
                    </CardDescription>
                  </div>
                  <TabsList className="shrink-0">
                    <TabsTrigger value="earnings">Earnings</TabsTrigger>
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  {isLoadingProjects ? (
                    <p className="text-sm text-muted-foreground">Loading projects...</p>
                  ) : selectedProject ? (
                    <div className="rounded-md border border-input/60 p-3">
                      <p className="text-sm text-muted-foreground">Importing into</p>
                      <p className="font-medium">{selectedProject.name}</p>
                    </div>
                  ) : (
                    <div className="rounded-md border border-input/60 p-4">
                      <p className="font-medium">No project available</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Create your first project and it will be selected automatically.
                      </p>
                      <Button className="mt-3" asChild>
                        <Link to="/projects/new">Create New Project</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <TabsContent value="earnings" className="mt-6">
                <ImportSection
                  selectedProject={selectedProject}
                  session={session}
                  fieldConfig={EARNING_FIELD_CONFIG}
                  importFn={importEarningsCsv}
                  entityLabel="earning"
                />
              </TabsContent>

              <TabsContent value="expenses" className="mt-6">
                <ImportSection
                  selectedProject={selectedProject}
                  session={session}
                  fieldConfig={EXPENSE_FIELD_CONFIG}
                  importFn={importExpensesCsv}
                  entityLabel="expense"
                />
              </TabsContent>
            </Tabs>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ImportDataPage;
