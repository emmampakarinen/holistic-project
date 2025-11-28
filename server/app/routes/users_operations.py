import json
from flask import Blueprint, jsonify, request 
from app.services.handle_db_connections import create_conn, execute_insert, execute_select

bp = Blueprint("users", __name__)

@bp.route("/insert-user", methods=['POST'])
def insert_user():

    try:
        user_info = request.get_json()
        if not user_info:
            return jsonify({"error": "No JSON data provided"}), 400
    except:
        return jsonify({"error": "Invalid JSON format"}), 400

    connection = create_conn()

    query = """
    INSERT INTO users (user_id, email, name, ev_cars)
    VALUES (%s, %s, %s, %s);
    """
    
    user_id = user_info.get("google_user_id")
    user_email = user_info.get("email")
    user_name = user_info.get("name")
    ev_cars = json.dumps(user_info.get("ev_cars"))
    
    insert_statements = [(user_id, user_email, user_name, ev_cars)]

    try:
        execute_insert(connection, query, insert_statements)
        return jsonify({"message": "User inserted successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@bp.route("/get-user-evs", methods=['POST'])
def get_user_evs():

    try:
        user_info = request.get_json()
        if not user_info:
            return jsonify({"error": "No JSON data provided"}), 400
    except:
        return jsonify({"error": "Invalid JSON format"}), 400

    user_id = request.get_json()

    connection = create_conn()

    query = """
    SELECT ev_cars FROM users
    WHERE user_id = %s 
    """

    try:
        result = execute_select(connection, query, (user_id,))        
        if not result:
            return jsonify({"error": "User not found"}), 404
        return jsonify(result[0]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500