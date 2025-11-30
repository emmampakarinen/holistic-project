import json
from flask import Blueprint, jsonify, request 
from app.services.handle_db_connections import create_conn, execute_select

bp = Blueprint("get_available_evs", __name__)

@bp.get("/get-available-evs")
def insert_user():

    connection = create_conn()

    query = """
    SELECT DISTINCT ev_name FROM ev_charger_analysis 
    """

    try:
        result = execute_select(connection, query)
        return result, 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500