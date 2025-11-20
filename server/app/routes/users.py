from flask import Blueprint, jsonify, request 
from app.services.handle_db_connections import create_conn, execute_insert

bp = Blueprint("users", __name__)

@bp.get("/insert-user")
def insert_user():

    # user_info = {"email": "tes111t@example.com", "name": "Test User", "ev_cars": '["Tesla Model Y", "Nissan Leaf", "Rivian R1S"]'}    

    try:
        user_info = request.get_json()
        if not user_info:
            return jsonify({"error": "No JSON data provided"}), 400
    except:
        return jsonify({"error": "Invalid JSON format"}), 400

    connection = create_conn()

    query = """
    INSERT INTO users (email, name, ev_cars)
    VALUES (%s, %s, %s);
    """
    
    user_email = user_info.get("email")
    user_name = user_info.get("name")
    ev_cars = user_info.get("ev_cars")
    
    insert_statements = [(user_email, user_name, ev_cars)]

    try:
        execute_insert(connection, query, insert_statements)
        return jsonify({"message": "User inserted successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500