import os
from flask import Flask
from flask_cors import CORS
from docs.swagger import init_swagger
from routes.health import health_bp
from routes.expenses import expenses_bp
from routes.earnings import earnings_bp
from routes.projects import projects_bp
from routes.chat import chat_bp

# Local dev origins always allowed; production origin loaded from env var.
_DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8787",
    "http://127.0.0.1:8787",
]


def create_app():
    app = Flask(__name__)

    allowed_origins = list(_DEFAULT_ORIGINS)
    frontend_url = os.getenv("FRONTEND_URL")
    if frontend_url:
        allowed_origins.append(frontend_url)

    print("FRONTEND_URL:", frontend_url)
    print("ALLOWED_ORIGINS:", allowed_origins)

    CORS(app, origins=allowed_origins)

    # --- Swagger / OpenAPI docs (http://localhost:5001/docs) ---
    init_swagger(app)

    # --- Register route blueprints ---
    app.register_blueprint(health_bp)
    app.register_blueprint(expenses_bp)
    app.register_blueprint(earnings_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(chat_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)

