import { useCallback, useState } from "react";
import { toast } from "sonner";

import FileUploadCard from "@/features/import-data/components/FileUploadCard";
import HeaderMappingCard from "@/features/import-data/components/HeaderMappingCard";
import { useCsvHeaderMapping } from "@/features/import-data/hooks/useCsvHeaderMapping";
import { getFileKey } from "@/features/import-data/utils/csvImportUtils";

const ImportSection = ({
  selectedProject,
  session,
  fieldConfig,
  importFn,
  entityLabel = "record",
}) => {
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
  } = useCsvHeaderMapping({ files, fieldConfig });

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
      toast.error(`Please upload at least one CSV file to import ${entityLabel}s.`);
      return;
    }
    if (!allRequiredMappingsReady) {
      const firstIncomplete = csvFiles.find((f) => !hasRequiredMappingForFile(getFileKey(f)));
      toast.error(`Please complete required mapping for "${firstIncomplete?.name || "CSV file"}"`);
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
          if (headerName) acc[headerName] = fieldKey;
          return acc;
        }, {});

        const result = await importFn(
          selectedProject.id,
          file,
          columnMapping,
          { userId: session?.user?.id }
        );

        importedCount += Number(result?.data?.imported ?? 0);
        skippedCount += Number(result?.data?.skipped ?? 0);
      }

      if (importedCount === 0) {
        toast.error(`No ${entityLabel}s were imported. Check your CSV and mapping.`);
        return;
      }

      toast.success(
        `${importedCount} ${entityLabel}${importedCount !== 1 ? "s" : ""} imported to "${selectedProject.name}"${
          skippedCount > 0 ? ` (${skippedCount} skipped)` : ""
        }`
      );

      handleClear();
    } catch {
      toast.error(`Failed to import ${entityLabel}s`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="grid w-full gap-6 lg:grid-cols-5 lg:items-start">
      <div className="space-y-6 lg:col-span-3">
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
        fieldConfig={fieldConfig}
        onFieldMappingChange={setActiveFieldMapping}
        getFileKey={getFileKey}
      />
    </div>
  );
};

export default ImportSection;
