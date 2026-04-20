import json
from datetime import date

from flask import Blueprint, jsonify, request, g, Response
from flasgger import swag_from
from middleware.auth import require_auth
from services.expense_service import (
    create_expense,
    get_expenses,
    get_expense_by_id,
    update_expense,
    delete_expense,
    get_budget_summary,
    import_expenses_from_csv,
    export_expenses_csv,
    export_budget_summary_csv,
)

expenses_bp = Blueprint("expenses", __name__)

REQUIRED_CREATE_FIELDS = ["name", "amount", "department", "expenseDate"]


@expenses_bp.route("/api/projects/<project_id>/expenses", methods=["POST"])
@require_auth
@swag_from("../docs/expenses_create.yml")
def create(project_id):
    body = request.get_json(silent=True) or {}

    missing = [f for f in REQUIRED_CREATE_FIELDS if not body.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    if not isinstance(body["amount"], (int, float)) or body["amount"] <= 0:
        return jsonify({"error": "amount must be a positive number"}), 400

    try:
        expense = create_expense(g.user_id, project_id, body)
        return jsonify({"data": expense}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@expenses_bp.route("/api/projects/<project_id>/expenses", methods=["GET"])
@require_auth
@swag_from("../docs/expenses_list.yml")
def list_expenses(project_id):
    department = request.args.get("department")

    try:
        expenses = get_expenses(g.user_id, project_id, department=department)
        return jsonify({"data": expenses, "count": len(expenses)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@expenses_bp.route("/api/projects/<project_id>/expenses/<expense_id>", methods=["GET"])
@require_auth
@swag_from("../docs/expenses_get.yml")
def get_one(project_id, expense_id):
    try:
        expense = get_expense_by_id(g.user_id, project_id, expense_id)
        if not expense:
            return jsonify({"error": "Expense not found"}), 404
        return jsonify({"data": expense}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 404


@expenses_bp.route("/api/projects/<project_id>/expenses/<expense_id>", methods=["PUT"])
@require_auth
@swag_from("../docs/expenses_update.yml")
def update(project_id, expense_id):
    body = request.get_json(silent=True) or {}

    if "amount" in body:
        if not isinstance(body["amount"], (int, float)) or body["amount"] <= 0:
            return jsonify({"error": "amount must be a positive number"}), 400

    try:
        expense = update_expense(g.user_id, project_id, expense_id, body)
        if not expense:
            return jsonify({"error": "Expense not found"}), 404
        return jsonify({"data": expense}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@expenses_bp.route("/api/projects/<project_id>/expenses/<expense_id>", methods=["DELETE"])
@require_auth
@swag_from("../docs/expenses_delete.yml")
def delete(project_id, expense_id):
    try:
        deleted = delete_expense(g.user_id, expense_id)
        if not deleted:
            return jsonify({"error": "Expense not found"}), 404
        return jsonify({"message": "Expense deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@expenses_bp.route("/api/projects/<project_id>/budget-summary", methods=["GET"])
@require_auth
@swag_from("../docs/budget_summary.yml")
def budget_summary(project_id):
    try:
        summary = get_budget_summary(g.user_id, project_id)
        if not summary:
            return jsonify({"error": "Project not found"}), 404
        return jsonify({"data": summary}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ── CSV Import ────────────────────────────────────────────────────────────

@expenses_bp.route("/api/projects/<project_id>/expenses/import", methods=["POST"])
@require_auth
@swag_from("../docs/expenses_import.yml")
def import_csv(project_id):
    file = request.files.get("file")
    if not file or not file.filename:
        return jsonify({"error": "No CSV file provided"}), 400

    if not file.filename.lower().endswith(".csv"):
        return jsonify({"error": "File must be a .csv"}), 400

    raw_mapping = request.form.get("mapping")
    if not raw_mapping:
        return jsonify({"error": "Missing 'mapping' form field"}), 400

    try:
        column_mapping = json.loads(raw_mapping)
    except (json.JSONDecodeError, TypeError):
        return jsonify({"error": "mapping must be valid JSON"}), 400

    if not isinstance(column_mapping, dict) or not column_mapping:
        return jsonify({"error": "mapping must be a non-empty JSON object"}), 400

    try:
        result = import_expenses_from_csv(
            g.user_id, project_id, file.stream, column_mapping
        )
        return jsonify({"data": result}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── CSV Export ────────────────────────────────────────────────────────────

def _csv_response(csv_string, filename):
    return Response(
        csv_string,
        mimetype="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@expenses_bp.route("/api/projects/<project_id>/expenses/export", methods=["GET"])
@require_auth
@swag_from("../docs/expenses_export.yml")
def export_project_expenses(project_id):
    try:
        csv_data = export_expenses_csv(g.user_id, project_id=project_id)
        filename = f"expenses_{project_id}_{date.today().isoformat()}.csv"
        return _csv_response(csv_data, filename)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@expenses_bp.route("/api/expenses/export", methods=["GET"])
@require_auth
@swag_from("../docs/expenses_export_all.yml")
def export_all_expenses():
    try:
        csv_data = export_expenses_csv(g.user_id)
        filename = f"all_expenses_{date.today().isoformat()}.csv"
        return _csv_response(csv_data, filename)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@expenses_bp.route("/api/projects/<project_id>/budget-summary/export", methods=["GET"])
@require_auth
@swag_from("../docs/budget_summary_export.yml")
def export_budget(project_id):
    try:
        csv_data = export_budget_summary_csv(g.user_id, project_id)
        if csv_data is None:
            return jsonify({"error": "Project not found"}), 404
        filename = f"budget_summary_{project_id}_{date.today().isoformat()}.csv"
        return _csv_response(csv_data, filename)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
