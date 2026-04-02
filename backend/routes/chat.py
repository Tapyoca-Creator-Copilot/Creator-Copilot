from flask import Blueprint, jsonify, g
from flasgger import swag_from
from middleware.auth import require_auth
from services.chat_context_service import get_chat_context, build_system_prompt

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/api/chat/context", methods=["GET"])
@require_auth
@swag_from("../docs/chat_context.yml")
def chat_context():
    """Return the user's full financial context as structured JSON."""
    try:
        context = get_chat_context(g.user_id)
        return jsonify({"data": context}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@chat_bp.route("/api/chat/system-prompt", methods=["GET"])
@require_auth
@swag_from("../docs/chat_system_prompt.yml")
def chat_system_prompt():
    """Return a pre-built system prompt string with the user's financial data baked in."""
    try:
        context = get_chat_context(g.user_id)
        prompt = build_system_prompt(context)
        return jsonify({"data": {"systemPrompt": prompt}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
