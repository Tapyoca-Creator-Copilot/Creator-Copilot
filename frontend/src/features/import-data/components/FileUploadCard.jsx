import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadItemPreview,
    FileUploadList,
    FileUploadTrigger,
} from "@/components/ui/file-upload";

const FileUploadCard = ({
  selectedProject,
  files,
  onFileReject,
  onValueChange,
  onImport,
  onClear,
  isImporting,
  canImport,
}) => {
  return (
    <Card
      className={`border-black/5 dark:border-white/10 transition-opacity ${
        !selectedProject ? "pointer-events-none opacity-50" : ""
      }`}
    >
      <CardHeader>
        <CardTitle>Upload Data Files</CardTitle>
        <CardDescription>
          {selectedProject
            ? `Import data to "${selectedProject.name}"`
            : "Select a project in the header to enable file upload"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FileUpload
          maxFiles={5}
          maxSize={10 * 1024 * 1024}
          className="w-full"
          value={files}
          onValueChange={onValueChange}
          onFileReject={onFileReject}
          multiple
          disabled={!selectedProject}
          accept=".csv,.xlsx,.xls"
        >
          <FileUploadDropzone>
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center justify-center rounded-full border p-2.5">
                <Upload className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Drag & drop files here</p>
              <p className="text-xs text-muted-foreground">
                Or click to browse (max 5 files, 10MB each)
              </p>
            </div>
            <FileUploadTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="mt-2 w-fit"
                disabled={!selectedProject}
              >
                Browse files
              </Button>
            </FileUploadTrigger>
          </FileUploadDropzone>
          <FileUploadList>
            {files.map((file, index) => (
              <FileUploadItem key={index} value={file}>
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <FileUploadItemDelete asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <X className="size-4" />
                  </Button>
                </FileUploadItemDelete>
              </FileUploadItem>
            ))}
          </FileUploadList>
        </FileUpload>

        <div className="flex gap-3 border-t border-black/5 dark:border-white/10 pt-4">
          <Button onClick={onImport} disabled={!canImport} size="lg">
            {isImporting ? "Importing..." : `Import ${files.length} File${files.length !== 1 ? "s" : ""}`}
          </Button>
          {files.length > 0 && (
            <Button variant="outline" size="lg" onClick={onClear}>
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploadCard;
