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

    print(user_info)

    query = """
    INSERT INTO users (user_id, email, name, ev_cars, trip_history)
    VALUES (%s, %s, %s, %s, %s);
    """
    
    user_id = user_info.get("googleUserId")
    user_email = user_info.get("emailAddress")
    user_name = user_info.get("fullName")
    ev_cars = json.dumps(user_info.get("evList"))
    trip_history = json.dumps([])

    insert_statements = [(user_id, user_email, user_name, ev_cars, trip_history)]

    try:
        execute_insert(connection, query, insert_statements)
        return jsonify({"message": "User inserted successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@bp.route("/get-user", methods=['POST'])
def get_user():

    try:
        user_info = request.get_json()
        if not user_info:
            return jsonify({"error": "No JSON data provided"}), 400
    except:
        return jsonify({"error": "Invalid JSON format"}), 400

    user_id = request.get_json()

    connection = create_conn()

    query = """
    SELECT * FROM users
    WHERE user_id = %s 
    """

    try:
        result = execute_select(connection, query, (user_id,))        
        if not result:
            return jsonify({"error": "user not found"}), 404
        return jsonify(result[0]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@bp.route("/get-user-evs", methods=['POST'])
def get_user_evs():

    try:
        info = request.get_json()
        if not info:
            return jsonify({"error": "No JSON data provided"}), 400
    except:
        return jsonify({"error": "Invalid JSON format"}), 400

    user_id = info.get('google_id')

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
    
@bp.route("/save-history", methods=['POST'])
def save_history():

    try:
        info = request.get_json()
        if not info:
            return jsonify({"error": "No JSON data provided"}), 400
    except:
        return jsonify({"error": "Invalid JSON format"}), 400

    user_id = info.get("user_id")
    connection = create_conn()

    cursor = connection.cursor() 
    
    query_select = "SELECT trip_history FROM users WHERE user_id = %s"
    cursor.execute(query_select, (user_id,))
    result = cursor.fetchone()

    if not result:
        cursor.close()
        connection.close()
        return jsonify({"error": "User not found"}), 404

    current_history = result[0]

    if current_history is None:
        trip_history_list = []
    elif isinstance(current_history, str):
        trip_history_list = json.loads(current_history)
    else:
        trip_history_list = current_history

    new_trip = {
        "starting_points": info.get('starting_points'),
        "ending_points": info.get('ending_points'),
        "car_start_charging_timestamp": info.get('car_start_charging_timestamp'),
        "expected_charging_time": info.get('expected_charging_time')
    }
    trip_history_list.append(new_trip)

    updated_history_json = json.dumps(trip_history_list)

    query_update = "UPDATE users SET trip_history = %s WHERE user_id = %s"

    try:
        cursor.execute(query_update, (updated_history_json, user_id))
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({"message": "Trip history updated successfully"}), 200

    except Exception as e:
        print(f"Update failed: {e}")
        return jsonify({"error": str(e)}), 500
    
@bp.route("/get-history", methods=['POST'])
def get_history():

    try:
        info = request.get_json()
        if not info:
            return jsonify({"error": "No JSON data provided"}), 400
    except:
        return jsonify({"error": "Invalid JSON format"}), 400

    user_id = info.get("google_id")
    connection = create_conn()

    cursor = connection.cursor() 
    
    query_select = "SELECT trip_history FROM users WHERE user_id = %s"
    cursor.execute(query_select, (user_id,))
    result = cursor.fetchone()

    if not result:
        cursor.close()
        connection.close()
        return jsonify({"error": "User not found"}), 404

    current_history = result[0]

    print(current_history)

    return(current_history)