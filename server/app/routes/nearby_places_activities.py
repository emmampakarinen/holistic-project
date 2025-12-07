import os
import requests
from flask import Blueprint, jsonify, request

bp = Blueprint("nearby_places_activities", __name__)

GOOGLE_API_KEY = os.getenv("VITE_GOOGLE_MAPS_API_KEY", "key")

PLACE_TYPES = {
    "coffee": ["cafe", "coffee_shop"],
    "food": ["restaurant", "bakery", "meal_takeaway"],
    "shopping": ["shopping_mall", "clothing_store", "department_store"],
    "entertainment": ["movie_theater", "bowling_alley", "tourist_attraction"],
    "fitness": ["gym"],
    "parks": ["park"]
}

@bp.route("/places-near-charger", methods=["POST"])
def get_places_near_charger():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
    except:
        return jsonify({"error": "Invalid JSON format"}), 400

    lat = data.get("latitude")
    lng = data.get("longitude")
    radius = data.get("radius_meters", 1000)

    if lat is None or lng is None:
        return jsonify({"error": "latitude and longitude are required"}), 400

    base_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

    results_grouped = {}

    for category, type_list in PLACE_TYPES.items():
        category_results = []

        for place_type in type_list:
            params = {
                "location": f"{lat},{lng}",
                "radius": radius,
                "type": place_type,
                "key": GOOGLE_API_KEY
            }

            response = requests.get(base_url, params=params)
            json_data = response.json()

            if json_data.get("results"):
                for place in json_data["results"][:3]:
                    category_results.append({
                        "name": place.get("name"),
                        "address": place.get("vicinity"),
                        "rating": place.get("rating", 0),
                        "userRatingsTotal": place.get("user_ratings_total", 0),
                        "location": place.get("geometry", {}).get("location", {}),
                        "placeId": place.get("place_id")
                    })

        results_grouped[category] = category_results

    return jsonify({
        "charger_location": {"lat": lat, "lng": lng},
        "places_nearby": results_grouped
    }), 200
