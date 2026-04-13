export const normalizeProject = (project) => {
  if (!project) {
    return null;
  }

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    budgetCeiling: Number(project.budgetCeiling ?? project.budget_ceiling ?? 0),
    currency: project.currency,
    projectType: project.projectType ?? project.project_type,
    startDate: project.startDate ?? project.start_date,
    endDate: project.endDate ?? project.end_date,
    createdAt: project.createdAt ?? project.created_at,
    userId: project.userId ?? project.user_id,
    isArchived: Boolean(project.isArchived ?? project.is_archived ?? false),
    archivedAt: project.archivedAt ?? project.archived_at ?? null,
  };
};

export const normalizeProjects = (projects) => (projects || []).map(normalizeProject).filter(Boolean);

export const PROJECT_SUPABASE_SELECT =
  "id, user_id, name, description, budget_ceiling, currency, project_type, start_date, end_date, created_at, is_archived, archived_at";