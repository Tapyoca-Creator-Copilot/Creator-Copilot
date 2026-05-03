import { apiFetchResponse } from "@/lib/apiClient";

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

export const resolveEarningSourceFilterValue = (sourceType) => {
  const value = typeof sourceType === "string" ? sourceType.trim() : "";
  if (!value) {
    return "Other";
  }

  return EARNING_SOURCE_TYPES.includes(value) ? value : "Other";
};

// ─── Normalizer ──────────────────────────────────────────────────────────────

export const normalizeEarning = (earning) => {
  if (!earning) return null;
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

// ─── API Client (Backend) ────────────────────────────────────────────────────

export const getEarnings = async (options = {}) => {
  if (!options.projectId) throw new Error("Project ID is required.");

  const query = new URLSearchParams();
  if (options.sourceType && options.sourceType !== "all") {
    query.append("sourceType", options.sourceType);
  }

  const url = `/api/projects/${options.projectId}/earnings${query.toString() ? `?${query}` : ""}`;
  const response = await apiFetchResponse(url);

  if (!response.ok) {
    throw new Error(`Failed to load earnings: ${response.statusText}`);
  }

  const json = await response.json();
  return {
    data: (json.data || []).map(normalizeEarning).filter(Boolean),
    source: "api",
  };
};

export const getEarningById = async (projectId, earningId) => {
  if (!projectId || !earningId) throw new Error("Project ID and Earning ID are required.");

  const url = `/api/projects/${projectId}/earnings/${earningId}`;
  const response = await apiFetchResponse(url);

  if (!response.ok) {
    if (response.status === 404) throw new Error("Earning not found.");
    throw new Error(`Failed to load earning: ${response.statusText}`);
  }

  const json = await response.json();
  return { data: normalizeEarning(json.data), source: "api" };
};

export const createEarning = async (payload) => {
  const projectId = payload.projectId;
  if (!projectId) throw new Error("Project ID is required.");
  if (!payload.name) throw new Error("Name is required.");
  if (typeof payload.amount !== "number" || payload.amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }
  if (!payload.sourceType) throw new Error("Source type is required.");
  if (!payload.earningDate) throw new Error("Earning date is required.");

  const url = `/api/projects/${projectId}/earnings`;
  const response = await apiFetchResponse(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name?.trim(),
      amount: payload.amount,
      sourceType: payload.sourceType,
      description: payload.description?.trim() || null,
      earningDate: payload.earningDate,
      contractUrl: payload.contractUrl?.trim() || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Unable to create earning.");
  }

  const json = await response.json();
  return { data: normalizeEarning(json.data), source: "api" };
};

export const updateEarning = async (earningId, payload, options = {}) => {
  const projectId = payload.projectId || options.projectId;
  if (!projectId || !earningId) throw new Error("Project ID and Earning ID are required.");

  const url = `/api/projects/${projectId}/earnings/${earningId}`;
  const response = await apiFetchResponse(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name?.trim() || undefined,
      amount: payload.amount !== undefined ? payload.amount : undefined,
      sourceType: payload.sourceType || undefined,
      description: payload.description?.trim() || null,
      earningDate: payload.earningDate || undefined,
      contractUrl: payload.contractUrl?.trim() || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Unable to update earning.");
  }

  const json = await response.json();
  return { data: normalizeEarning(json.data), source: "api" };
};

export const deleteEarning = async (earningId, options = {}) => {
  const projectId = options.projectId;
  if (!projectId || !earningId) throw new Error("Project ID and Earning ID are required.");

  const url = `/api/projects/${projectId}/earnings/${earningId}`;
  const response = await apiFetchResponse(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Unable to delete earning.");
  }

  return { data: { id: earningId }, source: "api" };
};

export const importEarningsFromCsv = async (projectId, file, columnMapping) => {
  if (!projectId) throw new Error("Project ID is required.");
  if (!file) throw new Error("CSV file is required.");
  if (!columnMapping || Object.keys(columnMapping).length === 0) {
    throw new Error("Column mapping is required.");
  }

  const url = `/api/projects/${projectId}/earnings/import`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mapping", JSON.stringify(columnMapping));

  const response = await apiFetchResponse(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Unable to import earnings.");
  }

  const json = await response.json();
  return {
    data: json.data,
    source: "api",
  };
};

export const exportEarningsAsCsv = async (projectId, options = {}) => {
  if (!options.userId) {
    throw new Error("You must be signed in to export earnings.");
  }

  if (!projectId) {
    throw new Error("Project ID is required to export earnings.");
  }

  const res = await apiFetchResponse(`/api/projects/${projectId}/earnings/export`, {
    method: "GET",
  });

  const blob = await res.blob();

  const getFilenameFromDisposition = (disposition) => {
    if (!disposition || typeof disposition !== "string") {
      return null;
    }
    const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    const raw = match?.[1] || match?.[2];
    if (!raw) {
      return null;
    }
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  };

  const filename =
    getFilenameFromDisposition(res.headers.get("content-disposition")) ||
    `earnings_${projectId}.csv`;

  return { blob, filename };
};
