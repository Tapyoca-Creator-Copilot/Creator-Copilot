import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { getCsvHeaders, getFileKey, isCsvFile } from "@/features/import-data/utils/csvImportUtils";

export const useCsvHeaderMapping = ({ files, fieldConfig }) => {
  const [headersByFile, setHeadersByFile] = useState({});
  const [mappingByFile, setMappingByFile] = useState({});
  const [selectedMappingFileKey, setSelectedMappingFileKey] = useState("");
  const [isParsingHeaders, setIsParsingHeaders] = useState(false);

  const csvFiles = useMemo(() => files.filter(isCsvFile), [files]);
  const hasCsvFiles = csvFiles.length > 0;

  useEffect(() => {
    let isCancelled = false;

    const parseHeadersFromCsvFiles = async () => {
      if (!hasCsvFiles) {
        setHeadersByFile({});
        setMappingByFile({});
        setSelectedMappingFileKey("");
        return;
      }

      setIsParsingHeaders(true);
      try {
        const nextHeadersByFile = {};
        const nextAutoMappingsByFile = {};

        for (const csvFile of csvFiles) {
          const fileKey = getFileKey(csvFile);
          const text = await csvFile.text();
          const headers = getCsvHeaders(text);

          nextHeadersByFile[fileKey] = headers;

          const autoMapped = {};
          fieldConfig.forEach((field) => {
            const match = headers.find(
              (header) => header.toLowerCase() === field.key.toLowerCase()
            );
            if (match) {
              autoMapped[field.key] = match;
            }
          });

          nextAutoMappingsByFile[fileKey] = autoMapped;
        }

        if (!isCancelled) {
          setHeadersByFile(nextHeadersByFile);
          setMappingByFile((prev) => {
            const merged = {};

            Object.entries(nextHeadersByFile).forEach(([fileKey, fileHeaders]) => {
              const prevMapping = prev[fileKey] || {};
              const filteredPrevMapping = {};

              Object.entries(prevMapping).forEach(([fieldKey, headerValue]) => {
                if (fileHeaders.includes(headerValue)) {
                  filteredPrevMapping[fieldKey] = headerValue;
                }
              });

              merged[fileKey] = {
                ...nextAutoMappingsByFile[fileKey],
                ...filteredPrevMapping,
              };
            });

            return merged;
          });

          setSelectedMappingFileKey((prev) => {
            if (prev && nextHeadersByFile[prev]) {
              return prev;
            }
            return Object.keys(nextHeadersByFile)[0] || "";
          });
        }
      } catch {
        if (!isCancelled) {
          toast.error("Could not read CSV headers for mapping.");
        }
      } finally {
        if (!isCancelled) {
          setIsParsingHeaders(false);
        }
      }
    };

    parseHeadersFromCsvFiles();

    return () => {
      isCancelled = true;
    };
  }, [csvFiles, fieldConfig, hasCsvFiles]);

  const hasRequiredMappingForFile = useCallback(
    (fileKey) => {
      const mapping = mappingByFile[fileKey] || {};
      return fieldConfig
        .filter((field) => field.required)
        .every((field) => Boolean(mapping[field.key]));
    },
    [fieldConfig, mappingByFile]
  );

  const allRequiredMappingsReady =
    csvFiles.length === 0 || csvFiles.every((file) => hasRequiredMappingForFile(getFileKey(file)));

  const activeDetectedHeaders = headersByFile[selectedMappingFileKey] || [];
  const activeMapping = mappingByFile[selectedMappingFileKey] || {};

  const setActiveFieldMapping = useCallback(
    (fieldKey, value) => {
      setMappingByFile((prev) => ({
        ...prev,
        [selectedMappingFileKey]: {
          ...(prev[selectedMappingFileKey] || {}),
          [fieldKey]: value,
        },
      }));
    },
    [selectedMappingFileKey]
  );

  const resetMappings = useCallback(() => {
    setHeadersByFile({});
    setMappingByFile({});
    setSelectedMappingFileKey("");
  }, []);

  return {
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
  };
};
