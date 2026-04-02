import os
from services.supabase_client import supabase

_PROMPTS_DIR = os.path.join(os.path.dirname(__file__), "..", "prompts")


def _load_prompt(filename):
    path = os.path.join(_PROMPTS_DIR, filename)
    with open(path, "r") as f:
        return f.read().strip()


def get_chat_context(user_id):
    """
    Pull all financial data for a user and return a structured context object
    that can be injected into an AI system prompt.
    """

    # 1. Get all projects
    projects_resp = (
        supabase.table("projects")
        .select("id, name, description, budget_ceiling, currency, project_type, start_date, end_date")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    projects = projects_resp.data or []

    # 2. For each project, get expenses and compute budget summary
    project_summaries = []
    for project in projects:
        expenses_resp = (
            supabase.table("expenses")
            .select("name, amount, department, category, expense_date, vendor")
            .eq("user_id", user_id)
            .eq("project_id", project["id"])
            .order("expense_date", desc=True)
            .execute()
        )
        expenses = expenses_resp.data or []

        budget_ceiling = float(project.get("budget_ceiling", 0))
        total_spent = sum(float(e["amount"]) for e in expenses)
        remaining = budget_ceiling - total_spent

        # Spending breakdown by department
        dept_totals = {}
        for e in expenses:
            dept = e.get("department", "Other")
            dept_totals[dept] = round(dept_totals.get(dept, 0) + float(e["amount"]), 2)

        project_summaries.append({
            "projectId": project["id"],
            "name": project["name"],
            "description": project.get("description"),
            "projectType": project.get("project_type"),
            "currency": project.get("currency", "USD"),
            "startDate": project.get("start_date"),
            "endDate": project.get("end_date"),
            "budget": {
                "ceiling": budget_ceiling,
                "totalSpent": round(total_spent, 2),
                "remaining": round(remaining, 2),
                "overBudget": remaining < 0,
            },
            "departmentBreakdown": dept_totals,
            "recentExpenses": [
                {
                    "name": e["name"],
                    "amount": float(e["amount"]),
                    "department": e.get("department"),
                    "category": e.get("category"),
                    "date": e.get("expense_date"),
                    "vendor": e.get("vendor"),
                }
                for e in expenses[:20]
            ],
            "totalExpenseCount": len(expenses),
        })

    return {
        "projectCount": len(projects),
        "projects": project_summaries,
    }


def build_system_prompt(context):
    """
    Convert the structured context into a natural-language system prompt
    for the AI model.
    """
    persona = _load_prompt("system_prompt.md")
    lines = [
        persona,
        "",
        "=== USER'S FINANCIAL DATA ===",
        "",
    ]

    projects = context.get("projects", [])
    if not projects:
        lines.append("The user has no projects yet.")
    else:
        lines.append(f"The user has {len(projects)} project(s):\n")

        for p in projects:
            budget = p["budget"]
            currency = p.get("currency", "USD")

            lines.append(f"--- Project: {p['name']} ({p.get('projectType', 'N/A')}) ---")
            if p.get("description"):
                lines.append(f"  Description: {p['description']}")
            lines.append(f"  Period: {p.get('startDate', '?')} to {p.get('endDate', '?')}")
            lines.append(f"  Budget Ceiling: {currency} {budget['ceiling']:,.2f}")
            lines.append(f"  Total Spent: {currency} {budget['totalSpent']:,.2f}")
            lines.append(f"  Remaining: {currency} {budget['remaining']:,.2f}")
            if budget["overBudget"]:
                lines.append(f"  ⚠ OVER BUDGET by {currency} {abs(budget['remaining']):,.2f}")

            dept = p.get("departmentBreakdown", {})
            if dept:
                lines.append(f"  Spending by department:")
                for dept_name, dept_total in sorted(dept.items(), key=lambda x: -x[1]):
                    lines.append(f"    - {dept_name}: {currency} {dept_total:,.2f}")

            recent = p.get("recentExpenses", [])
            if recent:
                lines.append(f"  Recent expenses ({min(len(recent), 10)} of {p.get('totalExpenseCount', len(recent))}):")
                for e in recent[:10]:
                    vendor_str = f" ({e['vendor']})" if e.get("vendor") else ""
                    lines.append(f"    - {e['date']}: {e['name']} — {currency} {e['amount']:,.2f} [{e.get('department', '?')}]{vendor_str}")

            lines.append("")

    lines.append("=== END OF FINANCIAL DATA ===")

    return "\n".join(lines)
