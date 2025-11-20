import os
import requests

def get_travel_times(maps_api_key, start_location, potential_chargers):

    # find time it takes to drive to the specific found chargers

    matrix_api_url = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": maps_api_key,
        "X-Goog-FieldMask": "destinationIndex,duration,distanceMeters"
    }
    
    dest_list_json = [] # list of formatted destinations
    for charger_loc in potential_chargers:
        dest_item = {
            "waypoint": {
                "location": {
                    "latLng": {
                        "latitude": charger_loc["location"]["latitude"],
                        "longitude": charger_loc["location"]["longitude"]
                    }
                }
            }
        }
        dest_list_json.append(dest_item)

    start_list_json = [{
        "waypoint": {
            "location": {"latLng": {"latitude": start_location["lat"], "longitude": start_location["lng"]}}
        }
    }]
    
    request_body = {
        "origins": start_list_json, # starting point coordinates
        "destinations": dest_list_json, # list of target charger locations
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE" # use real-time traffic data
    }
    
    print(f"calculating travel times to {len(potential_chargers)} destinations...")
    try:
        api_response = requests.post(matrix_api_url, json = request_body, headers = headers)
        api_response.raise_for_status()
        
        matrix_data = api_response.json() # parsed JSON response data
        
        for route_segment in matrix_data:
            dest_index = route_segment['destinationIndex'] # index matching input list.
            time_str = route_segment.get('duration', '99999s') # duration string (e.g., 120s)
            
            potential_chargers[dest_index]["travelTimeSecondsDrivingToCharger"] = int(time_str.replace('s', ''))
            potential_chargers[dest_index]["distanceMetersDrivingToCharger"] = route_segment.get('distanceMeters', 0)
            
        print("success - calculated all travel times")
        return potential_chargers

    except requests.exceptions.RequestException as e:
        print(f"routes api error: {e}")
        print("api response:", api_response.text)
        return []