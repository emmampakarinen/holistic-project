from flask import Blueprint, jsonify
import os, pymysql

bp = Blueprint("health", __name__)

@bp.get("/health")
def health():
    try:
        conn = pymysql.connect(
            host=os.getenv("MYSQL_HOST", "db"),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", "root"),
            database=os.getenv("MYSQL_DATABASE", "holistic"),
            connect_timeout=2,
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cur:
            cur.execute("SELECT 1 as ok;")
            row = cur.fetchone()
        conn.close()
        return jsonify({"ok": True, "db": "up" if row and row["ok"] == 1 else "unknown"})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)})
