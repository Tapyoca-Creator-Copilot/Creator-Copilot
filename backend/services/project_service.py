from services.supabase_client import supabase


def _normalize_project(row):
    if not row:
        return None

    return {
        "id": row["id"],
        "userId": row.get("user_id"),
        "name": row.get("name"),
        "description": row.get("description"),
        "budgetCeiling": float(row.get("budget_ceiling", 0)),
        "currency": row.get("currency"),
        "projectType": row.get("project_type"),
        "startDate": row.get("start_date"),
        "endDate": row.get("end_date"),
        "createdAt": row.get("created_at"),
    }


PROJECT_SELECT = (
    "id, user_id, name, description, budget_ceiling, currency, "
    "project_type, start_date, end_date, created_at"
)


def create_project(user_id, payload):
    row = {
        "user_id": user_id,
        "name": payload["name"].strip(),
        "description": payload["description"].strip(),
        "budget_ceiling": payload["budgetCeiling"],
        "currency": payload["currency"],
        "project_type": payload["projectType"],
        "start_date": payload["startDate"],
        "end_date": payload["endDate"],
    }

    resp = (
        supabase.table("projects")
        .insert(row)
        .execute()
    )

    if not resp.data:
        raise Exception("Failed to create project")

    return _normalize_project(resp.data[0])


def get_projects(user_id):
    resp = (
        supabase.table("projects")
        .select(PROJECT_SELECT)
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return [_normalize_project(r) for r in (resp.data or [])]


def get_project_by_id(user_id, project_id):
    resp = (
        supabase.table("projects")
        .select(PROJECT_SELECT)
        .eq("id", project_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    return _normalize_project(resp.data)


def update_project(user_id, project_id, payload):
    field_map = {
        "name": "name",
        "description": "description",
        "budgetCeiling": "budget_ceiling",
        "currency": "currency",
        "projectType": "project_type",
        "startDate": "start_date",
        "endDate": "end_date",
    }

    patch = {}
    for api_field, db_field in field_map.items():
        if api_field not in payload:
            continue

        value = payload[api_field]
        if isinstance(value, str):
            value = value.strip()
        patch[db_field] = value

    if not patch:
        raise Exception("No project fields provided")

    resp = (
        supabase.table("projects")
        .update(patch)
        .eq("id", project_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not resp.data:
        raise Exception("Project not found")

    return _normalize_project(resp.data[0])
