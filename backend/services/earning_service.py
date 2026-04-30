import csv
import io

from services.supabase_client import supabase
from services.csv_helpers import (
    MAX_IMPORT_ROWS,
    parse_date,
    parse_amount,
    get_project_date_range,
    date_in_range,
)

_VALID_EARNING_FIELDS = {
    "name", "amount", "sourceType", "earningDate",
    "description", "contractUrl",
}


def _normalize_earning(row):
    """Convert DB snake_case columns to camelCase for the API consumer."""
    if not row:
        return None

    project = row.get("projects")
    project_mini = None
    if project:
        project_mini = {
            "id": project.get("id"),
            "name": project.get("name"),
            "currency": project.get("currency"),
        }

    return {
        "id": row["id"],
        "userId": row.get("user_id"),
        "projectId": row.get("project_id"),
        "name": row.get("name"),
        "amount": float(row.get("amount", 0)),
        "sourceType": row.get("source_type"),
        "description": row.get("description"),
        "earningDate": row.get("earning_date"),
        "contractUrl": row.get("contract_url"),
        "createdAt": row.get("created_at"),
        "updatedAt": row.get("updated_at"),
        "project": project_mini,
    }


EARNING_SELECT = (
    "id, user_id, project_id, name, amount, source_type, "
    "description, earning_date, contract_url, created_at, updated_at, "
    "projects ( id, name, currency )"
)


def create_earning(user_id, project_id, payload):
    row = {
        "user_id": user_id,
        "project_id": project_id,
        "name": payload["name"].strip(),
        "amount": payload["amount"],
        "source_type": payload["sourceType"],
        "description": (payload.get("description") or "").strip() or None,
        "earning_date": payload["earningDate"],
        "contract_url": (payload.get("contractUrl") or "").strip() or None,
    }

    resp = supabase.table("earnings").insert(row).execute()

    if not resp.data:
        raise Exception("Failed to create earning")

    created_id = resp.data[0]["id"]
    return get_earning_by_id(user_id, project_id, created_id)


def get_earnings(user_id, project_id, source_type=None):
    query = (
        supabase.table("earnings")
        .select(EARNING_SELECT)
        .eq("user_id", user_id)
        .eq("project_id", project_id)
        .order("earning_date", desc=True)
        .order("created_at", desc=True)
    )

    if source_type and source_type != "all":
        query = query.eq("source_type", source_type)

    resp = query.execute()
    return [_normalize_earning(r) for r in (resp.data or [])]


def get_earning_by_id(user_id, project_id, earning_id):
    resp = (
        supabase.table("earnings")
        .select(EARNING_SELECT)
        .eq("id", earning_id)
        .eq("user_id", user_id)
        .eq("project_id", project_id)
        .single()
        .execute()
    )
    return _normalize_earning(resp.data)


def update_earning(user_id, project_id, earning_id, payload):
    allowed = {
        "name", "amount", "sourceType", "description",
        "earningDate", "contractUrl", "projectId",
    }
    camel_to_snake = {
        "sourceType": "source_type",
        "earningDate": "earning_date",
        "contractUrl": "contract_url",
        "projectId": "project_id",
    }

    patch = {}
    for key, value in payload.items():
        if key not in allowed:
            continue
        db_key = camel_to_snake.get(key, key)
        if isinstance(value, str):
            value = value.strip() or None
        patch[db_key] = value

    if not patch:
        return get_earning_by_id(user_id, project_id, earning_id)

    resp = (
        supabase.table("earnings")
        .update(patch)
        .eq("id", earning_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not resp.data:
        return None

    final_project_id = patch.get("project_id", project_id)
    return get_earning_by_id(user_id, final_project_id, earning_id)


def delete_earning(user_id, earning_id):
    resp = (
        supabase.table("earnings")
        .delete()
        .eq("id", earning_id)
        .eq("user_id", user_id)
        .execute()
    )
    return bool(resp.data)


# ---------------------------------------------------------------------------
# CSV Import
# ---------------------------------------------------------------------------

def import_earnings_from_csv(user_id, project_id, file_stream, column_mapping):
    """
    Parse a CSV file using the provided column_mapping and bulk-insert
    valid rows into the earnings table. Rejects rows whose date falls outside
    the project's start_date/end_date range.
    """
    for target in column_mapping.values():
        if target not in _VALID_EARNING_FIELDS:
            raise ValueError(f"Invalid mapping target: '{target}'")

    project_start, project_end = get_project_date_range(user_id, project_id)

    text = file_stream.read()
    if isinstance(text, bytes):
        text = text.decode("utf-8-sig")

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise ValueError("CSV file is empty or has no header row")

    missing_cols = [src for src in column_mapping if src not in reader.fieldnames]
    if missing_cols:
        raise ValueError(
            f"CSV is missing mapped column(s): {', '.join(missing_cols)}"
        )

    rows_to_insert = []
    errors = []

    for idx, csv_row in enumerate(reader, start=2):
        if idx - 1 > MAX_IMPORT_ROWS:
            errors.append({
                "row": idx,
                "error": f"Row limit ({MAX_IMPORT_ROWS}) exceeded — remaining rows skipped",
            })
            break

        mapped = {}
        for src_col, dest_field in column_mapping.items():
            mapped[dest_field] = (csv_row.get(src_col) or "").strip()

        row_errors = []

        if not mapped.get("name"):
            row_errors.append("name is required")
        if not mapped.get("sourceType"):
            row_errors.append("sourceType is required")

        amount = None
        try:
            amount = parse_amount(mapped.get("amount", ""))
            if amount <= 0:
                row_errors.append("amount must be positive")
        except (ValueError, TypeError):
            row_errors.append(f"invalid amount: '{mapped.get('amount', '')}'")

        earning_date = parse_date(mapped.get("earningDate", ""))
        if not earning_date:
            row_errors.append(
                f"invalid or missing date: '{mapped.get('earningDate', '')}'"
            )
        elif not date_in_range(earning_date, project_start, project_end):
            row_errors.append(
                f"date {earning_date} is outside project range "
                f"({(project_start or '?')[:10]} to {(project_end or '?')[:10]})"
            )

        if row_errors:
            errors.append({"row": idx, "error": "; ".join(row_errors)})
            continue

        rows_to_insert.append({
            "user_id": user_id,
            "project_id": project_id,
            "name": mapped["name"],
            "amount": amount,
            "source_type": mapped["sourceType"],
            "description": mapped.get("description") or None,
            "earning_date": earning_date,
            "contract_url": mapped.get("contractUrl") or None,
        })

    imported = 0
    if rows_to_insert:
        resp = supabase.table("earnings").insert(rows_to_insert).execute()
        imported = len(resp.data) if resp.data else 0

    return {
        "imported": imported,
        "skipped": len(errors),
        "errors": errors,
    }


# ---------------------------------------------------------------------------
# CSV Export
# ---------------------------------------------------------------------------

_EXPORT_HEADERS = [
    "Name", "Amount", "Source Type",
    "Date", "Description", "Contract URL", "Project", "Currency",
]


def export_earnings_csv(user_id, project_id=None):
    """
    Build an in-memory CSV string of earnings.
    If project_id is given, scopes to that project; otherwise exports all.
    """
    query = (
        supabase.table("earnings")
        .select(EARNING_SELECT)
        .eq("user_id", user_id)
        .order("earning_date", desc=True)
    )
    if project_id:
        query = query.eq("project_id", project_id)

    resp = query.execute()
    rows = [_normalize_earning(r) for r in (resp.data or [])]

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(_EXPORT_HEADERS)

    for r in rows:
        proj = r.get("project") or {}
        writer.writerow([
            r.get("name", ""),
            r.get("amount", ""),
            r.get("sourceType", ""),
            r.get("earningDate", ""),
            r.get("description", ""),
            r.get("contractUrl", ""),
            proj.get("name", ""),
            proj.get("currency", ""),
        ])

    return buf.getvalue()
