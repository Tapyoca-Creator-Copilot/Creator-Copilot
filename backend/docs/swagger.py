from flasgger import Swagger

SWAGGER_TEMPLATE = {
    "swagger": "2.0",
    "info": {
        "title": "Creator Copilot API",
        "description": "Backend API for Creator Copilot — project management and AI tools for creators.",
        "version": "1.0.0",
        "contact": {
            "name": "Creator Copilot Team",
        },
    },
    "host": "localhost:5001",
    "basePath": "/",
    "schemes": ["http"],
    "securityDefinitions": {
        "BearerAuth": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "Supabase access token. Format: **Bearer &lt;access_token&gt;**",
        }
    },
    "definitions": {
        "Expense": {
            "type": "object",
            "properties": {
                "id": {"type": "string", "example": "a1b2c3d4-..."},
                "userId": {"type": "string"},
                "projectId": {"type": "string"},
                "name": {"type": "string", "example": "Studio session"},
                "amount": {"type": "number", "example": 250.00},
                "department": {"type": "string", "example": "Studio / Venue"},
                "description": {"type": "string"},
                "expenseDate": {"type": "string", "format": "date"},
                "vendor": {"type": "string"},
                "receiptUrl": {"type": "string"},
                "createdAt": {"type": "string", "format": "date-time"},
                "updatedAt": {"type": "string", "format": "date-time"},
                "project": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "name": {"type": "string"},
                        "currency": {"type": "string"},
                    },
                },
            },
        },
        "Earning": {
            "type": "object",
            "properties": {
                "id": {"type": "string", "example": "a1b2c3d4-..."},
                "userId": {"type": "string"},
                "projectId": {"type": "string"},
                "name": {"type": "string", "example": "Spotify royalties Q1"},
                "amount": {"type": "number", "example": 1250.50},
                "sourceType": {"type": "string", "example": "Streaming"},
                "description": {"type": "string"},
                "earningDate": {"type": "string", "format": "date"},
                "contractUrl": {"type": "string"},
                "createdAt": {"type": "string", "format": "date-time"},
                "updatedAt": {"type": "string", "format": "date-time"},
                "project": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "name": {"type": "string"},
                        "currency": {"type": "string"},
                    },
                },
            },
        },
    },
}

SWAGGER_CONFIG = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/apispec.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/docs",
}


def init_swagger(app):
    """Attach Swagger/OpenAPI docs to the Flask app.

    Interactive UI available at:  http://localhost:5001/docs
    Raw JSON spec at:             http://localhost:5001/apispec.json
    """
    return Swagger(app, template=SWAGGER_TEMPLATE, config=SWAGGER_CONFIG)

