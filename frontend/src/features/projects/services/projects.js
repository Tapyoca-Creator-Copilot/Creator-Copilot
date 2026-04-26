import {
  archiveProjectForUser,
  checkProjectArchived,
  getArchivedProjectIds,
  getArchivedProjectsForUser,
  unarchiveProjectForUser,
} from "@/features/projects/services/projectArchiveStore";
import { normalizeProject, normalizeProjects } from "@/features/projects/services/projectModel";
import { apiFetch } from "@/lib/apiClient";

export const createProject = async (payload, options = {}) => {
  if (!options.userId && !payload.userId) {
    throw new Error("You must be signed in to create a project.");
  }

  const body = await apiFetch("/api/projects", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      description: payload.description,
      budgetCeiling: payload.budgetCeiling,
      currency: payload.currency,
      projectType: payload.projectType,
      startDate: payload.startDate,
      endDate: payload.endDate,
    }),
  });

  return {
    data: normalizeProject(body.data),
    source: "api",
  };
};

export const getProjects = async (options = {}) => {
  if (!options.userId) {
    throw new Error("You must be signed in to view projects.");
  }

  const body = await apiFetch("/api/projects");
  const archivedProjectIds = await getArchivedProjectIds(options.userId);

  return {
    data: normalizeProjects(body.data)
      .filter((project) => project && !archivedProjectIds.has(project.id)),
    source: "api",
  };
};

export const getProjectById = async (projectId, options = {}) => {
  if (!options.userId) {
    throw new Error("You must be signed in to view project details.");
  }

  const body = await apiFetch(`/api/projects/${projectId}`);
  const isArchived = await checkProjectArchived(projectId, options.userId);

  if (isArchived) {
    return {
      data: null,
      source: "api",
    };
  }

  return {
    data: normalizeProject(body.data),
    source: "api",
  };
};

export const archiveProject = async (projectId, options = {}) => {
  if (!projectId) {
    throw new Error("Project ID is required to archive a project.");
  }

  if (!options.userId) {
    throw new Error("You must be signed in to archive a project.");
  }

  const data = await archiveProjectForUser(projectId, options.userId);

  return {
    data,
    source: "supabase",
  };
};

export const unarchiveProject = async (projectId, options = {}) => {
  if (!projectId) {
    throw new Error("Project ID is required to unarchive a project.");
  }

  if (!options.userId) {
    throw new Error("You must be signed in to unarchive a project.");
  }

  const data = await unarchiveProjectForUser(projectId, options.userId);

  return {
    data,
    source: "supabase",
  };
};

export const getArchivedProjects = async (options = {}) => {
  if (!options.userId) {
    throw new Error("You must be signed in to view archived projects.");
  }

  return {
    data: await getArchivedProjectsForUser(options.userId),
    source: "supabase",
  };
};