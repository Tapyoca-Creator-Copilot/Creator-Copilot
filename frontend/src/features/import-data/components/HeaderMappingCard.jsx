import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const HeaderMappingCard = ({
  isParsingHeaders,
  csvFiles,
  selectedMappingFileKey,
  onSelectMappingFile,
  activeDetectedHeaders,
  activeMapping,
  fieldConfig,
  onFieldMappingChange,
  getFileKey,
}) => {
  return (
    <Card className="border-black/5 lg:col-span-2 lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle>Header Mapping</CardTitle>
        <CardDescription>
          Match your file headers to the fields required by the app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isParsingHeaders ? (
          <p className="text-sm text-muted-foreground">Reading CSV headers...</p>
        ) : csvFiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Upload at least one CSV file to configure field mapping.
          </p>
        ) : (
          <div className="space-y-3">
            {csvFiles.length > 1 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">CSV File</p>
                <Select value={selectedMappingFileKey} onValueChange={onSelectMappingFile}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select CSV file for mapping" />
                  </SelectTrigger>
                  <SelectContent>
                    {csvFiles.map((file) => {
                      const fileKey = getFileKey(file);
                      return (
                        <SelectItem key={fileKey} value={fileKey}>
                          {file.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {activeDetectedHeaders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This CSV file appears empty or has no readable headers.
              </p>
            ) : (
              <div className="grid gap-3">
                {fieldConfig.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <p className="text-xs font-medium text-foreground">
                      {field.label}
                      {field.required ? " *" : ""}
                    </p>
                    <Select
                      value={activeMapping[field.key] || "__none__"}
                      onValueChange={(value) => {
                        onFieldMappingChange(field.key, value === "__none__" ? "" : value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a header" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">
                          {field.required ? "Select header (required)" : "Not mapped"}
                        </SelectItem>
                        {activeDetectedHeaders.map((header) => (
                          <SelectItem key={`${field.key}-${header}`} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HeaderMappingCard;
