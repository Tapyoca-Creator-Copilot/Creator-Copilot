import { apiFetch, apiFetchResponse } from "@/lib/apiClient";
import { supabase } from "@/supabaseClient";

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

// ─── Normalizers ────────────────────────────────────────────────────────────

// Normalize a response from the backend API (camelCase keys)
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

// Normalize a row from Supabase (snake_case keys)
const normalizeEarningFromDb = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    name: row.name,
    amount: Number(row.amount ?? 0),
    sourceType: row.source_type,
    description: row.description ?? null,
    earningDate: row.earning_date,
    contractUrl: row.contract_url ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    project: row.project ?? null,
  };
};

const EARNINGS_SELECT =
  "id, user_id, project_id, name, amount, source_type, description, earning_date, contract_url, created_at, updated_at, project:projects(id, name, currency)";

// ─── Supabase (direct) ───────────────────────────────────────────────────────

export const getEarningsFromSupabase = async (options = {}) => {
  if (!options.userId) throw new Error("You must be signed in to view earnings.");
  if (!options.projectId) return { data: [], source: "supabase" };

  let query = supabase
    .from("earnings")
    .select(EARNINGS_SELECT)
    .eq("user_id", options.userId)
    .eq("project_id", options.projectId)
    .order("earning_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (options.sourceType && options.sourceType !== "all") {
    query = query.eq("source_type", options.sourceType);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message || "Unable to load earnings.");

  return {
    data: (data || []).map(normalizeEarningFromDb).filter(Boolean),
    source: "supabase",
  };
};

export const createEarningInSupabase = async (payload, options = {}) => {
  const userId = options.userId || payload.userId;
  if (!userId) throw new Error("You must be signed in to add an earning.");
  if (!payload.projectId) throw new Error("Project is required to add an earning.");

  const { data, error } = await supabase
    .from("earnings")
    .insert({
      user_id: userId,
      project_id: payload.projectId,
      name: payload.name?.trim() || "",
      amount: payload.amount,
      source_type: payload.sourceType,
      description: payload.description?.trim() || null,
      earning_date: payload.earningDate,
      contract_url: payload.contractUrl?.trim() || null,
    })
    .select(EARNINGS_SELECT)
    .single();

  if (error || !data) throw new Error(error?.message || "Unable to add earning.");

  return { data: normalizeEarningFromDb(data), source: "supabase" };
};

export const updateEarningInSupabase = async (earningId, payload, options = {}) => {
  const userId = options.userId ?? payload?.userId;
  if (!userId) throw new Error("You must be signed in to update an earning.");
  if (!earningId) throw new Error("Earning ID is required.");

  const { data, error } = await supabase
    .from("earnings")
    .update({
      name: payload.name,
      amount: payload.amount,
      source_type: payload.sourceType,
      description: payload.description || null,
      earning_date: payload.earningDate,
      contract_url: payload.contractUrl || null,
    })
    .eq("id", earningId)
    .eq("user_id", userId)
    .select(EARNINGS_SELECT)
    .single();

  if (error || !data) throw new Error(error?.message || "Unable to update earning.");

  return { data: normalizeEarningFromDb(data), source: "supabase" };
};

export const deleteEarningInSupabase = async (earningId, options = {}) => {
  if (!options.userId) throw new Error("You must be signed in to delete an earning.");
  if (!earningId) throw new Error("Earning ID is required.");

  const { error } = await supabase
    .from("earnings")
    .delete()
    .eq("id", earningId)
    .eq("user_id", options.userId);

  if (error) throw new Error(error.message || "Unable to delete earning.");

  return { data: { id: earningId }, source: "supabase" };
};

// ─── Backend API ─────────────────────────────────────────────────────────────

export const getEarningsFromApi = async (options = {}) => {
  if (!options.userId) throw new Error("You must be signed in to view earnings.");
  if (!options.projectId) return { data: [], source: "api" };

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

export const createEarningViaApi = async (payload, options = {}) => {
  if (!options.userId && !payload.userId) throw new Error("You must be signed in to add an earning.");
  if (!payload.projectId) throw new Error("Project is required to add an earning.");

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

  return { data: normalizeEarning(body.data), source: "api" };
};

export const updateEarningViaApi = async (earningId, payload, options = {}) => {
  const userId = options.userId ?? payload?.userId;
  if (!userId) throw new Error("You must be signed in to update an earning.");
  if (!earningId) throw new Error("Earning ID is required.");

  const projectId = payload.projectId || options.projectId;
  if (!projectId) throw new Error("Project ID is required.");

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

  return { data: normalizeEarning(body.data), source: "api" };
};

export const deleteEarningViaApi = async (earningId, options = {}) => {
  if (!options.userId) throw new Error("You must be signed in to delete an earning.");
  if (!earningId) throw new Error("Earning ID is required.");
  if (!options.projectId) throw new Error("Project ID is required.");

  await apiFetch(`/api/projects/${options.projectId}/earnings/${earningId}`, {
    method: "DELETE",
  });

  return { data: { id: earningId }, source: "api" };
};

export const importEarningsCsv = async (projectId, file, columnMapping, options = {}) => {
  if (!options.userId) throw new Error("You must be signed in to import earnings.");
  if (!projectId) throw new Error("Project ID is required to import earnings.");
  if (!file) throw new Error("A CSV file is required to import earnings.");
  if (!columnMapping || typeof columnMapping !== "object" || Array.isArray(columnMapping)) {
    throw new Error("A valid column mapping is required to import earnings.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("mapping", JSON.stringify(columnMapping));

  const body = await apiFetch(`/api/projects/${projectId}/earnings/import`, {
    method: "POST",
    body: form,
  });

  return { data: body.data, source: "api" };
};
