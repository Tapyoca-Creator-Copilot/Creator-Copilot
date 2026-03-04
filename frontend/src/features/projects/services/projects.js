import { apiFetch } from "@/lib/apiClient";

const normalizeProject = (project) => {
  if (!project) {
    return null;
  }

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    budgetCeiling: Number(project.budgetCeiling ?? 0),
    currency: project.currency,
    projectType: project.projectType,
    startDate: project.startDate,
    endDate: project.endDate,
    createdAt: project.createdAt,
    userId: project.userId,
  };
};

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

  return {
    data: (body.data || []).map(normalizeProject).filter(Boolean),
    source: "api",
  };
};

export const getProjectById = async (projectId, options = {}) => {
  if (!options.userId) {
    throw new Error("You must be signed in to view project details.");
  }

  const body = await apiFetch(`/api/projects/${projectId}`);

  return {
    data: normalizeProject(body.data),
    source: "api",
  };
};
