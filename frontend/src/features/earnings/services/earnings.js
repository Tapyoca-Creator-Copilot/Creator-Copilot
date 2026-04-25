import { apiFetch } from "@/lib/apiClient";

export const EARNING_SOURCE_TYPES = [
  "Music Release",
  "Film & Video",
  "Brand Deal",
  "Streaming",
  "Live Performance",
  "Merchandise",
  "Licensing",
  "Social Media",
  "Other",
];

export const normalizeEarning = (earning) => {
  if (!earning) {
    return null;
  }

  return {
    id: earning.id,
    userId: earning.userId,
    projectId: earning.projectId,
    name: earning.name,
    amount: Number(earning.amount ?? 0),
    sourceType: earning.sourceType,
    description: earning.description ?? null,
    earningDate: earning.earningDate,
    contractUrl: earning.contractUrl ?? null,
    createdAt: earning.createdAt,
    updatedAt: earning.updatedAt,
    project: earning.project ?? null,
  };
};

export const createEarning = async (payload, options = {}) => {
  if (!options.userId && !payload.userId) {
    throw new Error("You must be signed in to add an earning.");
  }

  if (!payload.projectId) {
    throw new Error("Project is required to add an earning.");
  }

  const body = await apiFetch(`/api/projects/${payload.projectId}/earnings`, {
    method: "POST",
    body: JSON.stringify({
      name: payload.name?.trim() || "",
      amount: payload.amount,
      sourceType: payload.sourceType,
      description: payload.description?.trim() || null,
      earningDate: payload.earningDate,
      contractUrl: payload.contractUrl?.trim() || null,
    }),
  });

  return {
    data: normalizeEarning(body.data),
    source: "api",
  };
};

export const getEarnings = async (options = {}) => {
  if (!options.userId) {
    throw new Error("You must be signed in to view earnings.");
  }

  if (!options.projectId) {
    return { data: [], source: "api" };
  }

  const params = new URLSearchParams();
  if (options.sourceType && options.sourceType !== "all") {
    params.set("sourceType", options.sourceType);
  }

  const qs = params.toString();
  const path = `/api/projects/${options.projectId}/earnings${qs ? `?${qs}` : ""}`;

  const body = await apiFetch(path);

  return {
    data: (body.data || []).map(normalizeEarning).filter(Boolean),
    source: "api",
  };
};

export const updateEarning = async (earningId, payload, options = {}) => {
  const userId = options.userId ?? payload?.userId;

  if (!userId) {
    throw new Error("You must be signed in to update an earning.");
  }

  if (!earningId) {
    throw new Error("Earning ID is required to update an earning.");
  }

  const projectId = payload.projectId || options.projectId;
  if (!projectId) {
    throw new Error("Project ID is required to update an earning.");
  }

  const body = await apiFetch(`/api/projects/${projectId}/earnings/${earningId}`, {
    method: "PUT",
    body: JSON.stringify({
      name: payload.name,
      amount: payload.amount,
      sourceType: payload.sourceType,
      description: payload.description,
      earningDate: payload.earningDate,
      contractUrl: payload.contractUrl,
      projectId: payload.projectId,
    }),
  });

  return {
    data: normalizeEarning(body.data),
    source: "api",
  };
};

export const deleteEarning = async (earningId, options = {}) => {
  if (!options.userId) {
    throw new Error("You must be signed in to delete an earning.");
  }

  if (!earningId) {
    throw new Error("Earning ID is required to delete an earning.");
  }

  if (!options.projectId) {
    throw new Error("Project ID is required to delete an earning.");
  }

  await apiFetch(`/api/projects/${options.projectId}/earnings/${earningId}`, {
    method: "DELETE",
  });

  return {
    data: { id: earningId },
    source: "api",
  };
};
