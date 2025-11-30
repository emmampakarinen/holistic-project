import requests

def get_coordinates(maps_api_key, target_address):

    # geocoding

    maps_geocode_url = "https://maps.googleapis.com/maps/api/geocode/json" # google maps geocoding api endpoint
    query_params = {"address": target_address, "key": maps_api_key}
    
    try:
        api_response = requests.get(maps_geocode_url, params=query_params)
        api_response.raise_for_status()
        geo_json = api_response.json() # parsed json response from geocoding api
        
        if not geo_json.get("results"):
            print("error - address not found")
            return None
            
        # extract the latitude and longitude from the first result
        geo_coords = geo_json["results"][0]["geometry"]["location"]
        print(f"success - found coordinates {geo_coords['lat']}, {geo_coords['lng']}")
        return geo_coords 

    except requests.exceptions.RequestException as request_error:
        print(f"geocoding api error: {request_error}")
        return None
    
def find_candidate_chargers(maps_api_key, search_center_coords, search_radius_meters):

    # find chargers in proximity

    places_api_url = "https://places.googleapis.com/v1/places:searchNearby" # google places api (new) endpoint for nearby search
    auth_headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": maps_api_key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.evChargeOptions,places.websiteUri" # specific fields to retrieve
    }

    search_payload = {
      "includedTypes": ["electric_vehicle_charging_station"], # filter for EV charging stations only
      "locationRestriction": {
        "circle": {
          "center": {"latitude": search_center_coords["lat"], "longitude": search_center_coords["lng"]},
          "radius": search_radius_meters # search radius in meters
        }
      }
    }
    
    try:
        
        api_response = requests.post(places_api_url, json=search_payload, headers=auth_headers)
        api_response.raise_for_status()
        places_json = api_response.json()
        found_places = places_json.get("places", []) # list of places returned by the api
        valid_chargers = []
        for place in found_places:
            # ensure the place actually has EV charging options data
            if place.get('evChargeOptions'):
                valid_chargers.append(place)

        print(f"success - found {len(valid_chargers)} candidates.")
        
        return valid_chargers
        
    except requests.exceptions.RequestException as request_error:
        print(f"places api error: {request_error}")
        return []
    
def get_travel_times(maps_api_key, origin_coords, charger_candidates):

    # find time it takes to walk from the charger to the destination

    matrix_api_url = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix"
    auth_headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": maps_api_key,
        "X-Goog-FieldMask": "destinationIndex,duration,distanceMeters"
    }
    
    dest_list_json = [] # list of formatted destinations (chargers)
    for charger in charger_candidates:
        dest_item = {
            "waypoint": {
                "location": {
                    "latLng": {
                        "latitude": charger["location"]["latitude"],
                        "longitude": charger["location"]["longitude"]
                    }
                }
            }
        }
        dest_list_json.append(dest_item)

    start_list_json = [{
        "waypoint": {
            "location": {"latLng": {"latitude": origin_coords["lat"], "longitude": origin_coords["lng"]}}
        }
    }]
    
    request_body = {
        "origins": start_list_json, # starting point (destination address)
        "destinations": dest_list_json, # target points (chargers)
        "travelMode": "WALK" # calculate walking time (not driving)
    }
    
    print(f"calculating travel times to {len(charger_candidates)} destinations...")
    try:
        api_response = requests.post(matrix_api_url, json = request_body, headers = auth_headers)
        api_response.raise_for_status()
        
        matrix_data = api_response.json()
        
        for route_segment in matrix_data:
            dest_index = route_segment['destinationIndex']
            time_str = route_segment.get('duration', '99999s') # duration string (e.g. 300s)
            
            # parse duration string to integer seconds
            charger_candidates[dest_index]["travelTimeSecondsWalkingToDestination"] = int(time_str.replace('s', ''))
            charger_candidates[dest_index]["distanceMetersWalkingToDestination"] = route_segment.get('distanceMeters', 0)
            
        print("success - calculated all travel times")
        return charger_candidates

    except requests.exceptions.RequestException as request_error:
        print(f"routes api error: {request_error}")
        print("api response:", api_response.text)
        return []

def find_chargers_by_travel_time(maps_api_key, target_address, max_walk_seconds, max_search_radius):

    dest_coords = get_coordinates(maps_api_key, target_address)
    if not dest_coords:
        return []
    
    nearby_stations = find_candidate_chargers(maps_api_key, dest_coords, max_search_radius)
    if not nearby_stations:
        return []
        
    stations_with_walk_times = get_travel_times(maps_api_key, dest_coords, nearby_stations)
    if not stations_with_walk_times:
        return []
        
    print(f"filtering for chargers within {max_walk_seconds} seconds...")
    
    filtered_stations = []
    for station in stations_with_walk_times:
        # check if the walking time is within the user's limit
        if "travelTimeSecondsWalkingToDestination" in station and station["travelTimeSecondsWalkingToDestination"] <= max_walk_seconds:
            filtered_stations.append(station)
            
    # sort by walking time (closest first)
    filtered_stations.sort(key=lambda x: x.get("travelTimeSecondsWalkingToDestination", 9999))        

    # fallback - if no chargers meet the strict walking criteria, return the closest one anyway
    if not filtered_stations:
        stations_with_walk_times.sort(key=lambda x: x.get("travelTimeSecondsWalkingToDestination", 9999))    
        filtered_stations = [stations_with_walk_times[0]]

    return filtered_stations

