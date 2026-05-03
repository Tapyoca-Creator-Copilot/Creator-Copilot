import os
from services.supabase_client import supabase

_PROMPTS_DIR = os.path.join(os.path.dirname(__file__), "..", "prompts")


def _load_prompt(filename):
    path = os.path.join(_PROMPTS_DIR, filename)
    with open(path, "r") as f:
        return f.read().strip()


def get_chat_context(user_id):
    """
    Pull all financial data for a user (projects, expenses, earnings) and
    return a structured context object that can be injected into an AI
    system prompt.
    """

    projects_resp = (
        supabase.table("projects")
        .select("id, name, description, budget_ceiling, currency, project_type, start_date, end_date")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    projects = projects_resp.data or []

    project_summaries = []
    for project in projects:
        expenses_resp = (
            supabase.table("expenses")
            .select("name, amount, department, expense_date, vendor")
            .eq("user_id", user_id)
            .eq("project_id", project["id"])
            .order("expense_date", desc=True)
            .execute()
        )
        expenses = expenses_resp.data or []

        earnings_resp = (
            supabase.table("earnings")
            .select("name, amount, source_type, earning_date, description")
            .eq("user_id", user_id)
            .eq("project_id", project["id"])
            .order("earning_date", desc=True)
            .execute()
        )
        earnings = earnings_resp.data or []

        budget_ceiling = float(project.get("budget_ceiling", 0))
        total_spent = sum(float(e["amount"]) for e in expenses)
        remaining = budget_ceiling - total_spent

        total_earned = sum(float(e["amount"]) for e in earnings)
        profit = total_earned - total_spent

        dept_totals = {}
        for e in expenses:
            dept = e.get("department", "Other")
            dept_totals[dept] = round(dept_totals.get(dept, 0) + float(e["amount"]), 2)

        source_totals = {}
        for e in earnings:
            src = e.get("source_type", "Other")
            source_totals[src] = round(source_totals.get(src, 0) + float(e["amount"]), 2)

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
            "earnings": {
                "totalEarned": round(total_earned, 2),
                "profit": round(profit, 2),
                "isProfitable": profit >= 0,
            },
            "departmentBreakdown": dept_totals,
            "sourceTypeBreakdown": source_totals,
            "recentExpenses": [
                {
                    "name": e["name"],
                    "amount": float(e["amount"]),
                    "department": e.get("department"),
                    "date": e.get("expense_date"),
                    "vendor": e.get("vendor"),
                }
                for e in expenses[:20]
            ],
            "recentEarnings": [
                {
                    "name": e["name"],
                    "amount": float(e["amount"]),
                    "sourceType": e.get("source_type"),
                    "date": e.get("earning_date"),
                    "description": e.get("description"),
                }
                for e in earnings[:20]
            ],
            "totalExpenseCount": len(expenses),
            "totalEarningCount": len(earnings),
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
            earn = p.get("earnings", {})
            currency = p.get("currency", "USD")

            lines.append(f"--- Project: {p['name']} ({p.get('projectType', 'N/A')}) ---")
            if p.get("description"):
                lines.append(f"  Description: {p['description']}")
            lines.append(f"  Period: {p.get('startDate', '?')} to {p.get('endDate', '?')}")

            lines.append(f"  Budget Ceiling: {currency} {budget['ceiling']:,.2f}")
            lines.append(f"  Total Spent: {currency} {budget['totalSpent']:,.2f}")
            lines.append(f"  Remaining: {currency} {budget['remaining']:,.2f}")
            if budget["overBudget"]:
                lines.append(f"  OVER BUDGET by {currency} {abs(budget['remaining']):,.2f}")

            total_earned = earn.get("totalEarned", 0)
            profit = earn.get("profit", 0)
            lines.append(f"  Total Earned: {currency} {total_earned:,.2f}")
            lines.append(f"  Profit (earned - spent): {currency} {profit:,.2f}")
            if not earn.get("isProfitable", True):
                lines.append(f"  Currently at a LOSS of {currency} {abs(profit):,.2f}")

            dept = p.get("departmentBreakdown", {})
            if dept:
                lines.append(f"  Expenses by department:")
                for dept_name, dept_total in sorted(dept.items(), key=lambda x: -x[1]):
                    lines.append(f"    - {dept_name}: {currency} {dept_total:,.2f}")

            sources = p.get("sourceTypeBreakdown", {})
            if sources:
                lines.append(f"  Earnings by source:")
                for src_name, src_total in sorted(sources.items(), key=lambda x: -x[1]):
                    lines.append(f"    - {src_name}: {currency} {src_total:,.2f}")

            recent_e = p.get("recentExpenses", [])
            if recent_e:
                lines.append(f"  Recent expenses ({min(len(recent_e), 10)} of {p.get('totalExpenseCount', len(recent_e))}):")
                for e in recent_e[:10]:
                    vendor_str = f" ({e['vendor']})" if e.get("vendor") else ""
                    lines.append(f"    - {e['date']}: {e['name']} — {currency} {e['amount']:,.2f} [{e.get('department', '?')}]{vendor_str}")

            recent_earn = p.get("recentEarnings", [])
            if recent_earn:
                lines.append(f"  Recent earnings ({min(len(recent_earn), 10)} of {p.get('totalEarningCount', len(recent_earn))}):")
                for e in recent_earn[:10]:
                    lines.append(f"    - {e['date']}: {e['name']} — {currency} {e['amount']:,.2f} [{e.get('sourceType', '?')}]")

            lines.append("")

    lines.append("=== END OF FINANCIAL DATA ===")

    return "\n".join(lines)
