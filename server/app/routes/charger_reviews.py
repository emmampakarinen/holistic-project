import json
from flask import Blueprint, jsonify, request 
from app.services.handle_db_connections import create_conn, execute_insert, execute_select

bp = Blueprint("charger_reviews", __name__)

@bp.route("/insert-review", methods=['POST'])
def insert_review():

    try:
        info = request.get_json()
        if not info:
            return jsonify({"error": "No JSON data provided"}), 400
    except:
        return jsonify({"error": "Invalid JSON format"}), 400
    
    info = {
        "google_charger_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
        "rating": 1,
        "review": "Nice!",
        "user_id": "104598189720184254586"
    }

    connection = create_conn()

    query = """
    INSERT INTO charger_reviews (google_charger_id, rating, review, user_id)
    VALUES (%s, %s, %s, %s);
    """

    ###############################################################

    google_charger_id = info.get("google_user_id")
    user_email = info.get("email")
    user_name = info.get("name")
    ev_cars = json.dumps(info.get("ev_cars"))
    
    insert_statements = [(google_charger_id, user_email, user_name, ev_cars)]

    ###############################################################

    try:
        execute_insert(connection, query, insert_statements)
        return jsonify({"message": "User inserted successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@bp.route("/get-charger-ratings", methods=['POST'])
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
    SELECT AVG(rating) FROM charger_reviews
    WHERE google_charger_id = %s 
    """

    try:
        result = execute_select(connection, query, (user_id,))        
        if not result:
            return jsonify({"error": "User not found"}), 404
        return jsonify(result[0]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500