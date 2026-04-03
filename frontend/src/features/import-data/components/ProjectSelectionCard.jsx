import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProjectSelectionCard = ({
  isLoadingProjects,
  projects,
  selectedProject,
  onSelectProject,
}) => {
  return (
    <Card className="border-black/5 dark:border-white/10">
      <CardHeader>
        <CardTitle>Select Project</CardTitle>
        <CardDescription>
          Choose the project where you want to import data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingProjects ? (
          <p className="text-sm text-muted-foreground">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="rounded-lg p-4 text-center">
            <p className="mb-2 text-sm text-muted-foreground">No projects found</p>
            <Button variant="default" size="sm" asChild>
              <a href="/projects/new">Create a project first</a>
            </Button>
          </div>
        ) : (
          <Select value={selectedProject?.id || ""} onValueChange={onSelectProject}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectSelectionCard;
