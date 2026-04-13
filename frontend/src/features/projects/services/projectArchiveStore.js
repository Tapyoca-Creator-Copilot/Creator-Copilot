import { supabase } from "@/supabaseClient";

import { PROJECT_SUPABASE_SELECT, normalizeProjects } from "@/features/projects/services/projectModel";

export const getArchivedProjectIds = async (userId) => {
  if (!userId) {
    return new Set();
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", userId)
    .eq("is_archived", true);

  if (error) {
    return new Set();
  }

  return new Set((data || []).map((project) => project.id));
};

export const checkProjectArchived = async (projectId, userId) => {
  if (!projectId || !userId) {
    return false;
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .eq("is_archived", true)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data?.id);
};

export const archiveProjectForUser = async (projectId, userId) => {
  const archivedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("projects")
    .update({
      is_archived: true,
      archived_at: archivedAt,
    })
    .eq("id", projectId)
    .eq("user_id", userId)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to archive project.");
  }

  return {
    id: data.id,
    isArchived: true,
    archivedAt,
  };
};

export const unarchiveProjectForUser = async (projectId, userId) => {
  const { data, error } = await supabase
    .from("projects")
    .update({
      is_archived: false,
      archived_at: null,
    })
    .eq("id", projectId)
    .eq("user_id", userId)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to unarchive project.");
  }

  return {
    id: data.id,
    isArchived: false,
    archivedAt: null,
  };
};

export const getArchivedProjectsForUser = async (userId) => {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SUPABASE_SELECT)
    .eq("user_id", userId)
    .eq("is_archived", true)
    .order("archived_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Unable to load archived projects.");
  }

  return normalizeProjects(data);
};