import { useNavigate } from "react-router-dom";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActiveProject } from "@/features/projects/hooks/useActiveProject";

const CREATE_PROJECT_VALUE = "__create_project__";

export function GlobalProjectSelector() {
  const navigate = useNavigate();
  const { projects, activeProjectId, isLoadingProjects, setActiveProjectId } = useActiveProject();

  const handleValueChange = (value) => {
    if (value === CREATE_PROJECT_VALUE) {
      navigate("/projects/new");
      return;
    }

    setActiveProjectId(value);
  };

  const hasProjects = projects.length > 0;

  return (
    <div className="w-full max-w-65">
      <Select
        value={activeProjectId || undefined}
        onValueChange={handleValueChange}
        disabled={isLoadingProjects}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={
              isLoadingProjects
                ? "Loading projects..."
                : hasProjects
                  ? "Select project"
                  : "No projects yet"
            }
          />
        </SelectTrigger>
        <SelectContent align="end">
          {hasProjects ? (
            projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value={CREATE_PROJECT_VALUE}>Create New Project</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
