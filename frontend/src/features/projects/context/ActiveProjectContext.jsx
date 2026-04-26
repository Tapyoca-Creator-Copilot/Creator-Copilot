import { useCallback, useEffect, useMemo, useState } from "react";

import { UserAuth } from "@/features/auth/context/AuthContext";
import { ActiveProjectContext } from "@/features/projects/context/activeProjectStore";
import { getProjects } from "@/features/projects/services/projects";

const STORAGE_PREFIX = "creator-copilot:active-project:";

const getStorageKey = (userId) => `${STORAGE_PREFIX}${userId}`;

const readSavedProjectId = (userId) => {
  if (!userId || typeof window === "undefined") {
    return "";
  }

  try {
    return window.localStorage.getItem(getStorageKey(userId)) || "";
  } catch {
    return "";
  }
};

const writeSavedProjectId = (userId, projectId) => {
  if (!userId || typeof window === "undefined") {
    return;
  }

  try {
    if (projectId) {
      window.localStorage.setItem(getStorageKey(userId), projectId);
      return;
    }

    window.localStorage.removeItem(getStorageKey(userId));
  } catch {
    // Ignore localStorage failures in private mode or restricted environments.
  }
};

export const ActiveProjectProvider = ({ children }) => {
  const { session } = UserAuth();
  const userId = session?.user?.id || "";

  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectIdState] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const applyActiveProjectId = useCallback(
    (nextProjectId) => {
      setActiveProjectIdState(nextProjectId || "");
      writeSavedProjectId(userId, nextProjectId || "");
    },
    [userId]
  );

  const refreshProjects = useCallback(async () => {
    if (!userId) {
      setProjects([]);
      setActiveProjectIdState("");
      setIsLoadingProjects(false);
      return;
    }

    setIsLoadingProjects(true);
    try {
      const { data } = await getProjects({ userId });
      const nextProjects = data || [];
      setProjects(nextProjects);

      const savedProjectId = readSavedProjectId(userId);
      const hasExistingSelection =
        activeProjectId && nextProjects.some((project) => project.id === activeProjectId);
      const hasSavedSelection =
        savedProjectId && nextProjects.some((project) => project.id === savedProjectId);

      let nextActiveProjectId = "";

      if (hasExistingSelection) {
        nextActiveProjectId = activeProjectId;
      } else if (hasSavedSelection) {
        nextActiveProjectId = savedProjectId;
      } else if (nextProjects.length > 0) {
        nextActiveProjectId = nextProjects[0].id;
      }

      applyActiveProjectId(nextActiveProjectId);
    } catch {
      setProjects([]);
      applyActiveProjectId("");
    }
    setIsLoadingProjects(false);
  }, [activeProjectId, applyActiveProjectId, userId]);

  useEffect(() => {
    if (!userId) {
      setProjects([]);
      setActiveProjectIdState("");
      setIsLoadingProjects(false);
      return;
    }

    refreshProjects();
  }, [refreshProjects, userId]);

  const setActiveProjectId = useCallback(
    (nextProjectId) => {
      if (!nextProjectId) {
        applyActiveProjectId("");
        return;
      }

      const projectExists = projects.some((project) => project.id === nextProjectId);
      if (!projectExists) {
        return;
      }

      applyActiveProjectId(nextProjectId);
    },
    [applyActiveProjectId, projects]
  );

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || null,
    [activeProjectId, projects]
  );

  const value = useMemo(
    () => ({
      projects,
      activeProjectId,
      activeProject,
      isLoadingProjects,
      refreshProjects,
      setActiveProjectId,
    }),
    [activeProject, activeProjectId, isLoadingProjects, projects, refreshProjects, setActiveProjectId]
  );

  return <ActiveProjectContext.Provider value={value}>{children}</ActiveProjectContext.Provider>;
};
