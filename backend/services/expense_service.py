import csv
import io
import re
from datetime import datetime

from services.supabase_client import supabase

MAX_IMPORT_ROWS = 500

_VALID_EXPENSE_FIELDS = {
    "name", "amount", "department", "expenseDate",
    "category", "description", "vendor", "receiptUrl",
}

_DATE_PATTERNS = [
    (re.compile(r"^\d{4}-\d{2}-\d{2}$"), "%Y-%m-%d"),
    (re.compile(r"^\d{1,2}/\d{1,2}/\d{4}$"), "%m/%d/%Y"),
    (re.compile(r"^\d{1,2}-\d{1,2}-\d{4}$"), "%m-%d-%Y"),
]


def _parse_date(value):
    """Try several common date formats and return YYYY-MM-DD or None."""
    if not value:
        return None
    value = value.strip()
    for pattern, fmt in _DATE_PATTERNS:
        if pattern.match(value):
            try:
                return datetime.strptime(value, fmt).strftime("%Y-%m-%d")
            except ValueError:
                continue
    return None


def _normalize_expense(row):
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
        "department": row.get("department"),
        "category": row.get("category"),
        "description": row.get("description"),
        "expenseDate": row.get("expense_date"),
        "vendor": row.get("vendor"),
        "receiptUrl": row.get("receipt_url"),
        "createdAt": row.get("created_at"),
        "updatedAt": row.get("updated_at"),
        "project": project_mini,
    }


EXPENSE_SELECT = (
    "id, user_id, project_id, name, amount, department, category, "
    "description, expense_date, vendor, receipt_url, created_at, updated_at, "
    "projects ( id, name, currency )"
)


def create_expense(user_id, project_id, payload):
    row = {
        "user_id": user_id,
        "project_id": project_id,
        "name": payload["name"].strip(),
        "amount": payload["amount"],
        "department": payload["department"],
        "category": (payload.get("category") or "").strip() or None,
        "description": (payload.get("description") or "").strip() or None,
        "expense_date": payload["expenseDate"],
        "vendor": (payload.get("vendor") or "").strip() or None,
        "receipt_url": (payload.get("receiptUrl") or "").strip() or None,
    }

    resp = (
        supabase.table("expenses")
        .insert(row)
        .execute()
    )

    if not resp.data:
        raise Exception("Failed to create expense")

    # Re-fetch with project join so the response includes project info.
    created_id = resp.data[0]["id"]
    return get_expense_by_id(user_id, project_id, created_id)


def get_expenses(user_id, project_id, department=None):
    query = (
        supabase.table("expenses")
        .select(EXPENSE_SELECT)
        .eq("user_id", user_id)
        .eq("project_id", project_id)
        .order("expense_date", desc=True)
        .order("created_at", desc=True)
    )

    if department and department != "all":
        query = query.eq("department", department)

    resp = query.execute()
    return [_normalize_expense(r) for r in (resp.data or [])]


def get_expense_by_id(user_id, project_id, expense_id):
    resp = (
        supabase.table("expenses")
        .select(EXPENSE_SELECT)
        .eq("id", expense_id)
        .eq("user_id", user_id)
        .eq("project_id", project_id)
        .single()
        .execute()
    )
    return _normalize_expense(resp.data)


def update_expense(user_id, project_id, expense_id, payload):
    allowed = {
        "name", "amount", "department", "category",
        "description", "expenseDate", "vendor", "receiptUrl", "projectId",
    }
    camel_to_snake = {
        "expenseDate": "expense_date",
        "receiptUrl": "receipt_url",
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
        return get_expense_by_id(user_id, project_id, expense_id)

    resp = (
        supabase.table("expenses")
        .update(patch)
        .eq("id", expense_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not resp.data:
        return None

    final_project_id = patch.get("project_id", project_id)
    return get_expense_by_id(user_id, final_project_id, expense_id)


def delete_expense(user_id, expense_id):
    resp = (
        supabase.table("expenses")
        .delete()
        .eq("id", expense_id)
        .eq("user_id", user_id)
        .execute()
    )
    return bool(resp.data)


def get_budget_summary(user_id, project_id):
    """Return budget ceiling, total spent, and remaining for a project."""
    project_resp = (
        supabase.table("projects")
        .select("budget_ceiling")
        .eq("id", project_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not project_resp.data:
        return None

    budget_ceiling = float(project_resp.data["budget_ceiling"])

    expenses_resp = (
        supabase.table("expenses")
        .select("amount")
        .eq("user_id", user_id)
        .eq("project_id", project_id)
        .execute()
    )

    total_spent = sum(float(e["amount"]) for e in (expenses_resp.data or []))
    remaining = budget_ceiling - total_spent

    return {
        "budgetCeiling": budget_ceiling,
        "totalSpent": round(total_spent, 2),
        "remaining": round(remaining, 2),
        "overBudget": remaining < 0,
    }


# ---------------------------------------------------------------------------
# CSV Import
# ---------------------------------------------------------------------------

def import_expenses_from_csv(user_id, project_id, file_stream, column_mapping):
    """
    Parse a CSV file using the provided column_mapping and bulk-insert
    valid rows into the expenses table.

    column_mapping maps CSV header names to expense field names, e.g.:
        {"Date": "expenseDate", "Description": "name", ...}

    Returns {"imported": int, "skipped": int, "errors": [...]}.
    """
    for target in column_mapping.values():
        if target not in _VALID_EXPENSE_FIELDS:
            raise ValueError(f"Invalid mapping target: '{target}'")

    text = file_stream.read()
    if isinstance(text, bytes):
        text = text.decode("utf-8-sig")

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise ValueError("CSV file is empty or has no header row")

    missing_cols = [
        src for src in column_mapping if src not in reader.fieldnames
    ]
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
        if not mapped.get("department"):
            row_errors.append("department is required")

        amount = None
        raw_amount = mapped.get("amount", "")
        raw_amount = raw_amount.replace(",", "").replace("$", "").strip()
        try:
            amount = float(raw_amount)
            if amount <= 0:
                row_errors.append("amount must be positive")
        except (ValueError, TypeError):
            row_errors.append(f"invalid amount: '{mapped.get('amount', '')}'")

        expense_date = _parse_date(mapped.get("expenseDate", ""))
        if not expense_date:
            row_errors.append(
                f"invalid or missing date: '{mapped.get('expenseDate', '')}'"
            )

        if row_errors:
            errors.append({"row": idx, "error": "; ".join(row_errors)})
            continue

        rows_to_insert.append({
            "user_id": user_id,
            "project_id": project_id,
            "name": mapped["name"],
            "amount": amount,
            "department": mapped["department"],
            "category": mapped.get("category") or None,
            "description": mapped.get("description") or None,
            "expense_date": expense_date,
            "vendor": mapped.get("vendor") or None,
            "receipt_url": mapped.get("receiptUrl") or None,
        })

    imported = 0
    if rows_to_insert:
        resp = supabase.table("expenses").insert(rows_to_insert).execute()
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
    "Name", "Amount", "Department", "Category",
    "Date", "Vendor", "Description", "Project", "Currency",
]


def export_expenses_csv(user_id, project_id=None):
    """
    Build an in-memory CSV string of expenses.
    If project_id is given, scopes to that project; otherwise exports all.
    """
    query = (
        supabase.table("expenses")
        .select(EXPENSE_SELECT)
        .eq("user_id", user_id)
        .order("expense_date", desc=True)
    )
    if project_id:
        query = query.eq("project_id", project_id)

    resp = query.execute()
    rows = [_normalize_expense(r) for r in (resp.data or [])]

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(_EXPORT_HEADERS)

    for r in rows:
        proj = r.get("project") or {}
        writer.writerow([
            r.get("name", ""),
            r.get("amount", ""),
            r.get("department", ""),
            r.get("category", ""),
            r.get("expenseDate", ""),
            r.get("vendor", ""),
            r.get("description", ""),
            proj.get("name", ""),
            proj.get("currency", ""),
        ])

    return buf.getvalue()


def export_budget_summary_csv(user_id, project_id):
    """
    Build an in-memory CSV with the budget summary and department breakdown.
    """
    project_resp = (
        supabase.table("projects")
        .select("name, budget_ceiling, currency")
        .eq("id", project_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not project_resp.data:
        return None

    project = project_resp.data
    currency = project.get("currency", "USD")
    budget_ceiling = float(project["budget_ceiling"])

    expenses_resp = (
        supabase.table("expenses")
        .select("amount, department")
        .eq("user_id", user_id)
        .eq("project_id", project_id)
        .execute()
    )
    expenses = expenses_resp.data or []
    total_spent = sum(float(e["amount"]) for e in expenses)
    remaining = budget_ceiling - total_spent

    dept_totals = {}
    for e in expenses:
        dept = e.get("department", "Other")
        dept_totals[dept] = round(dept_totals.get(dept, 0) + float(e["amount"]), 2)

    buf = io.StringIO()
    writer = csv.writer(buf)

    writer.writerow(["Budget Summary", project["name"]])
    writer.writerow(["Currency", currency])
    writer.writerow([])
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Budget Ceiling", f"{budget_ceiling:.2f}"])
    writer.writerow(["Total Spent", f"{total_spent:.2f}"])
    writer.writerow(["Remaining", f"{remaining:.2f}"])
    writer.writerow(["Over Budget", "Yes" if remaining < 0 else "No"])
    writer.writerow([])
    writer.writerow(["Department Breakdown", ""])
    writer.writerow(["Department", "Amount"])
    for dept_name, dept_total in sorted(dept_totals.items(), key=lambda x: -x[1]):
        writer.writerow([dept_name, f"{dept_total:.2f}"])

    return buf.getvalue()
