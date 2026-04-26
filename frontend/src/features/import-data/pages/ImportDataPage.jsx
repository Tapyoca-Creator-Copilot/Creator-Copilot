import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserAuth } from "@/features/auth/context/AuthContext";
import { importExpensesCsv } from "@/features/expenses/services/expenses";
import FileUploadCard from "@/features/import-data/components/FileUploadCard";
import HeaderMappingCard from "@/features/import-data/components/HeaderMappingCard";
import { EXPENSE_FIELD_CONFIG } from "@/features/import-data/constants/expenseFieldConfig";
import { useCsvHeaderMapping } from "@/features/import-data/hooks/useCsvHeaderMapping";
import { getFileKey } from "@/features/import-data/utils/csvImportUtils";
import { useActiveProject } from "@/features/projects/hooks/useActiveProject";

const ImportDataPage = () => {
  const { session } = UserAuth();
  const { activeProject: selectedProject, isLoadingProjects } = useActiveProject();
  const [files, setFiles] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  const {
    csvFiles,
    hasCsvFiles,
    mappingByFile,
    selectedMappingFileKey,
    setSelectedMappingFileKey,
    isParsingHeaders,
    activeDetectedHeaders,
    activeMapping,
    hasRequiredMappingForFile,
    allRequiredMappingsReady,
    setActiveFieldMapping,
    resetMappings,
  } = useCsvHeaderMapping({
    files,
    fieldConfig: EXPENSE_FIELD_CONFIG,
  });

  const onFileReject = useCallback((file, message) => {
    toast.error(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}"`,
    });
  }, []);

  const handleClear = () => {
    setFiles([]);
    resetMappings();
  };

  const canImport =
    Boolean(selectedProject) &&
    files.length > 0 &&
    !isImporting &&
    hasCsvFiles &&
    allRequiredMappingsReady;

  const handleImport = async () => {
    if (!selectedProject) {
      toast.error("Please select a project first");
      return;
    }

    if (files.length === 0) {
      toast.error("Please select files to import");
      return;
    }

    if (!hasCsvFiles) {
      toast.error("Please upload at least one CSV file to import expenses.");
      return;
    }

    if (!allRequiredMappingsReady) {
      const firstIncompleteCsv = csvFiles.find(
        (file) => !hasRequiredMappingForFile(getFileKey(file))
      );
      toast.error(
        `Please complete required mapping for "${firstIncompleteCsv?.name || "CSV file"}"`
      );
      return;
    }

    setIsImporting(true);
    try {
      let importedCount = 0;
      let skippedCount = 0;

      for (const file of csvFiles) {
        const fileKey = getFileKey(file);
        const fieldToHeader = mappingByFile[fileKey] || {};

        const columnMapping = Object.entries(fieldToHeader).reduce((acc, [fieldKey, headerName]) => {
          if (headerName) {
            acc[headerName] = fieldKey;
          }
          return acc;
        }, {});

        const result = await importExpensesCsv(
          selectedProject.id,
          file,
          columnMapping,
          { userId: session?.user?.id }
        );

        importedCount += Number(result?.data?.imported ?? 0);
        skippedCount += Number(result?.data?.skipped ?? 0);
      }

      if (importedCount === 0) {
        toast.error("No expenses were imported. Check your CSV and mapping.");
        return;
      }

      toast.success(
        `${importedCount} expense${importedCount !== 1 ? "s" : ""} imported to "${selectedProject.name}"${
          skippedCount > 0 ? ` (${skippedCount} skipped)` : ""
        }`
      );

      handleClear();
    } catch {
      toast.error("Failed to import files");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <SidebarProvider style={{ "--sidebar-width": "260px" }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Import Data" />
        <div className="p-6 md:p-8">
          <div className="mx-auto grid w-full max-w-full gap-6 lg:grid-cols-5 lg:items-start">
            <div className="space-y-6 lg:col-span-3">
              <Card className="border-black/5 dark:border-white/10">
                <CardHeader>
                  <CardTitle>Active Project</CardTitle>
                  <CardDescription>
                    {isLoadingProjects
                      ? "Loading your projects..."
                      : selectedProject
                        ? "Imports will use the globally selected project from the header."
                        : "Create a project to start importing expenses."}
                  </CardDescription>
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

              <FileUploadCard
                selectedProject={selectedProject}
                files={files}
                onFileReject={onFileReject}
                onValueChange={setFiles}
                onImport={handleImport}
                onClear={handleClear}
                isImporting={isImporting}
                canImport={canImport}
              />
            </div>

            <HeaderMappingCard
              isParsingHeaders={isParsingHeaders}
              csvFiles={csvFiles}
              selectedMappingFileKey={selectedMappingFileKey}
              onSelectMappingFile={setSelectedMappingFileKey}
              activeDetectedHeaders={activeDetectedHeaders}
              activeMapping={activeMapping}
              fieldConfig={EXPENSE_FIELD_CONFIG}
              onFieldMappingChange={setActiveFieldMapping}
              getFileKey={getFileKey}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ImportDataPage;
