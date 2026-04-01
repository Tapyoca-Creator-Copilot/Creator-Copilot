import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserAuth } from "@/features/auth/context/AuthContext";
import { createExpense } from "@/features/expenses/services/expenses";
import FileUploadCard from "@/features/import-data/components/FileUploadCard";
import HeaderMappingCard from "@/features/import-data/components/HeaderMappingCard";
import ProjectSelectionCard from "@/features/import-data/components/ProjectSelectionCard";
import { EXPENSE_FIELD_CONFIG } from "@/features/import-data/constants/expenseFieldConfig";
import { useCsvHeaderMapping } from "@/features/import-data/hooks/useCsvHeaderMapping";
import {
    getFileKey,
    normalizeDate,
    parseAmount,
    parseCsvRecords,
} from "@/features/import-data/utils/csvImportUtils";
import { getProjects } from "@/features/projects/services/projects";

const ImportDataPage = () => {
  const { session } = UserAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
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

  useEffect(() => {
    const fetchProjects = async () => {
      if (!session?.user?.id) return;

      try {
        const { data } = await getProjects({ userId: session.user.id });
        setProjects(data || []);
      } catch {
        toast.error("Failed to load projects");
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [session?.user?.id]);

  const onFileReject = useCallback((file, message) => {
    toast.error(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}"`,
    });
  }, []);

  const handleSelectProject = (projectId) => {
    const project = projects.find((item) => item.id === projectId) || null;
    setSelectedProject(project);
  };

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
      let createdCount = 0;
      let skippedCount = 0;

      for (const file of csvFiles) {
        const fileKey = getFileKey(file);
        const mapping = mappingByFile[fileKey] || {};
        const text = await file.text();
        const records = parseCsvRecords(text);

        for (const record of records) {
          const name = (record[mapping.name] || "").trim();
          const department = (record[mapping.department] || "").trim();
          const amount = parseAmount(record[mapping.amount]);
          const expenseDate = normalizeDate(record[mapping.expenseDate]);
          const vendor = (record[mapping.vendor] || "").trim() || null;
          const description = (record[mapping.description] || "").trim() || null;

          if (!name || !department || !expenseDate || !Number.isFinite(amount) || amount <= 0) {
            skippedCount += 1;
            continue;
          }

          try {
            await createExpense(
              {
                projectId: selectedProject.id,
                name,
                amount,
                department,
                expenseDate,
                vendor,
                description,
              },
              { userId: session?.user?.id }
            );
            createdCount += 1;
          } catch {
            skippedCount += 1;
          }
        }
      }

      if (createdCount === 0) {
        toast.error("No expenses were imported. Check mapping and row values.");
        return;
      }

      toast.success(
        `${createdCount} expense${createdCount !== 1 ? "s" : ""} imported to "${selectedProject.name}"${
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
              <ProjectSelectionCard
                isLoadingProjects={isLoadingProjects}
                projects={projects}
                selectedProject={selectedProject}
                onSelectProject={handleSelectProject}
              />

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
