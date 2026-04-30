"""Shared helpers for CSV import validation across expense and earning services."""

import re
from datetime import datetime

from services.supabase_client import supabase

MAX_IMPORT_ROWS = 500

_DATE_PATTERNS = [
    (re.compile(r"^\d{4}-\d{2}-\d{2}$"), "%Y-%m-%d"),
    (re.compile(r"^\d{1,2}/\d{1,2}/\d{4}$"), "%m/%d/%Y"),
    (re.compile(r"^\d{1,2}-\d{1,2}-\d{4}$"), "%m-%d-%Y"),
]


def parse_date(value):
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


def parse_amount(raw):
    """Parse a CSV amount cell (handles $ and , formatting). Returns float or raises ValueError."""
    if raw is None:
        raise ValueError("amount is empty")
    cleaned = str(raw).replace(",", "").replace("$", "").strip()
    if not cleaned:
        raise ValueError("amount is empty")
    return float(cleaned)


def get_project_date_range(user_id, project_id):
    """
    Fetch a project's start_date and end_date for date-range validation.
    Returns (start_date_str, end_date_str). Either may be None if not set.
    Raises ValueError if the project doesn't exist or doesn't belong to the user.
    """
    resp = (
        supabase.table("projects")
        .select("start_date, end_date")
        .eq("id", project_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not resp.data:
        raise ValueError("Project not found")
    return resp.data.get("start_date"), resp.data.get("end_date")


def date_in_range(date_str, start_date, end_date):
    """
    Check whether date_str (YYYY-MM-DD) falls within [start_date, end_date] inclusive.
    Either bound may be None. start_date / end_date may include a 'T...' time portion
    if they came from a timestamptz column — only the date prefix is compared.
    """
    if not date_str:
        return False
    if start_date and date_str < start_date[:10]:
        return False
    if end_date and date_str > end_date[:10]:
        return False
    return True
