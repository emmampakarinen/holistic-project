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

    # info = {
    #     "google_charger_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    #     "rating": 1,
    #     "review": "Nice!",
    #     "user_id": "104598189720184254586"
    # }

    connection = create_conn()

    query = """
    INSERT INTO charger_reviews (google_charger_id, rating, review, user_id)
    VALUES (%s, %s, %s, %s);
    """

    ###############################################################

    google_charger_id = info.get("google_charger_id")
    # user_email = info.get("email")
    # user_name = info.get("name")
    # ev_cars = json.dumps(info.get("ev_cars"))
    rating = info.get("rating")
    review = info.get("review")
    user_id = info.get("user_id")

    insert_statements = [(google_charger_id, rating, review, user_id)]

    ###############################################################

    try:
        execute_insert(connection, query, insert_statements)
        return jsonify({"message": "Review inserted successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route("/get-charger-ratings", methods=['POST'])
def get_charger_rating():
    try:
        data = request.get_json()
        if not data or "google_charger_id" not in data:
            return jsonify({"error": "google_charger_id is required"}), 400

        charger_id = data["google_charger_id"]

        connection = create_conn()

        query = """
        SELECT ROUND(AVG(rating), 2) AS average_rating
        FROM charger_reviews
        WHERE google_charger_id = %s
        """

        result = execute_select(connection, query, (charger_id,))

        avg_rating = result[0]["average_rating"] if result[0]["average_rating"] else 0

        return jsonify({"average_rating": avg_rating}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
