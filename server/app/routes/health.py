from flask import Blueprint, jsonify
from app.services.handle_db_connections import create_conn

bp = Blueprint("health", __name__)

# health check endpoint
@bp.get("/health")
def health():
    try:
        connection = create_conn()
        with connection.cursor() as cur:
            cur.execute("SELECT 1 as ok;")
            row = cur.fetchone()
        connection.close()
        return jsonify({"ok": True, "db": "up" if row and row["ok"] == 1 else "unknown"})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)})
