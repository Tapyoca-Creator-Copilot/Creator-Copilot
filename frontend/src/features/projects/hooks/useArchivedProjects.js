import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { getArchivedProjects, unarchiveProject } from "@/features/projects/services/projects";

export const useArchivedProjects = (userId) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recoveringProjectId, setRecoveringProjectId] = useState("");

  const loadProjects = useCallback(async () => {
    if (!userId) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await getArchivedProjects({ userId });
      setProjects(data || []);
    } catch (error) {
      setProjects([]);
      toast.error(error?.message || "Unable to load archived projects.");
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const recoverProject = useCallback(
    async (project) => {
      if (!project?.id || !userId) {
        return;
      }

      setRecoveringProjectId(project.id);
      try {
        await unarchiveProject(project.id, { userId });
        setProjects((previous) => (previous || []).filter((item) => item.id !== project.id));
        toast.success(`Recovered \"${project.name}\"`);
      } catch (error) {
        toast.error(error?.message || "Unable to recover this project.");
      }
      setRecoveringProjectId("");
    },
    [userId]
  );

  return {
    projects,
    isLoading,
    recoveringProjectId,
    recoverProject,
  };
};