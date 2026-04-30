import json
from datetime import date

from flask import Blueprint, jsonify, request, g, Response
from flasgger import swag_from
from middleware.auth import require_auth
from services.earning_service import (
    create_earning,
    get_earnings,
    get_earning_by_id,
    update_earning,
    delete_earning,
    import_earnings_from_csv,
    export_earnings_csv,
)

earnings_bp = Blueprint("earnings", __name__)

REQUIRED_CREATE_FIELDS = ["name", "amount", "sourceType", "earningDate"]


@earnings_bp.route("/api/projects/<project_id>/earnings", methods=["POST"])
@require_auth
@swag_from("../docs/earnings_create.yml")
def create(project_id):
    body = request.get_json(silent=True) or {}

    missing = [f for f in REQUIRED_CREATE_FIELDS if not body.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    if not isinstance(body["amount"], (int, float)) or body["amount"] <= 0:
        return jsonify({"error": "amount must be a positive number"}), 400

    try:
        earning = create_earning(g.user_id, project_id, body)
        return jsonify({"data": earning}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@earnings_bp.route("/api/projects/<project_id>/earnings", methods=["GET"])
@require_auth
@swag_from("../docs/earnings_list.yml")
def list_earnings(project_id):
    source_type = request.args.get("sourceType")

    try:
        earnings = get_earnings(g.user_id, project_id, source_type=source_type)
        return jsonify({"data": earnings, "count": len(earnings)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@earnings_bp.route("/api/projects/<project_id>/earnings/<earning_id>", methods=["GET"])
@require_auth
@swag_from("../docs/earnings_get.yml")
def get_one(project_id, earning_id):
    try:
        earning = get_earning_by_id(g.user_id, project_id, earning_id)
        if not earning:
            return jsonify({"error": "Earning not found"}), 404
        return jsonify({"data": earning}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 404


@earnings_bp.route("/api/projects/<project_id>/earnings/<earning_id>", methods=["PUT"])
@require_auth
@swag_from("../docs/earnings_update.yml")
def update(project_id, earning_id):
    body = request.get_json(silent=True) or {}

    if "amount" in body and body["amount"] is not None:
        if not isinstance(body["amount"], (int, float)) or body["amount"] <= 0:
            return jsonify({"error": "amount must be a positive number"}), 400

    try:
        earning = update_earning(g.user_id, project_id, earning_id, body)
        if not earning:
            return jsonify({"error": "Earning not found"}), 404
        return jsonify({"data": earning}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@earnings_bp.route("/api/projects/<project_id>/earnings/<earning_id>", methods=["DELETE"])
@require_auth
@swag_from("../docs/earnings_delete.yml")
def delete(project_id, earning_id):
    try:
        deleted = delete_earning(g.user_id, earning_id)
        if not deleted:
            return jsonify({"error": "Earning not found"}), 404
        return jsonify({"message": "Earning deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ── CSV Import ────────────────────────────────────────────────────────────

@earnings_bp.route("/api/projects/<project_id>/earnings/import", methods=["POST"])
@require_auth
@swag_from("../docs/earnings_import.yml")
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
        result = import_earnings_from_csv(
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


@earnings_bp.route("/api/projects/<project_id>/earnings/export", methods=["GET"])
@require_auth
@swag_from("../docs/earnings_export.yml")
def export_project_earnings(project_id):
    try:
        csv_data = export_earnings_csv(g.user_id, project_id=project_id)
        filename = f"earnings_{project_id}_{date.today().isoformat()}.csv"
        return _csv_response(csv_data, filename)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
