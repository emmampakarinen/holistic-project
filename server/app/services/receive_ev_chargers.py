import os
import requests

def get_coordinates(api_key, address):

    # geocoding

    geocode_url = "https://maps.googleapis.com/maps/api/geocode/json"
    geocode_params = {"address": address, "key": api_key}
    
    try:
        response = requests.get(geocode_url, params=geocode_params)
        response.raise_for_status()
        geocode_data = response.json()
        
        if not geocode_data.get("results"):
            print("error - address not found")
            return None
            
        location = geocode_data["results"][0]["geometry"]["location"]
        print(f"success - found coordinates {location['lat']}, {location['lng']}")
        return location 

    except requests.exceptions.RequestException as e:
        print(f"geocoding api error: {e}")
        return None
    
def find_candidate_chargers(api_key, location, radius_meters):

    # find chargers in proximity

    places_url = "https://places.googleapis.com/v1/places:searchNearby"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.rating,places.evChargeOptions"
    }

    body = {
      "includedTypes": ["electric_vehicle_charging_station"],
      "locationRestriction": {
        "circle": {
          "center": {"latitude": location["lat"], "longitude": location["lng"]},
          "radius": radius_meters
        }
      }
    }
    
    try:
        
        response = requests.post(places_url, json=body, headers=headers)
        response.raise_for_status()
        places_data = response.json()
        candidates = places_data.get("places", [])
        
        actual_candidates = []
        for i in candidates:
            if i.get('evChargeOptions'):
                actual_candidates.append(i)

        print(f"success - found {len(actual_candidates)} candidates.")
        
        return actual_candidates
        
    except requests.exceptions.RequestException as e:
        print(f"places api error: {e}")
        return []
    
def get_travel_times(api_key, origin, candidates):

    # find time it takes to drive to the specific found chargers

    routes_url = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "destinationIndex,duration,distanceMeters"
    }
    
    destinations_payload = []
    for place in candidates:
        dest = {
            "waypoint": {
                "location": {
                    "latLng": {
                        "latitude": place["location"]["latitude"],
                        "longitude": place["location"]["longitude"]
                    }
                }
            }
        }
        destinations_payload.append(dest)

    origin_payload = [{
        "waypoint": {
            "location": {"latLng": {"latitude": origin["lat"], "longitude": origin["lng"]}}
        }
    }]
    
    body = {
        "origins": origin_payload,
        "destinations": destinations_payload,
        "travelMode": "WALK"
    }
    
    print(f"calculating travel times to {len(candidates)} destinations...")
    try:
        response = requests.post(routes_url, json = body, headers = headers)
        response.raise_for_status()
        
        routes_data = response.json()
        
        for route_info in routes_data:
            idx = route_info['destinationIndex']
            duration_str = route_info.get('duration', '99999s')
            
            candidates[idx]["travelTimeSecondsWalkingToDestination"] = int(duration_str.replace('s', ''))
            candidates[idx]["distanceMetersWalkingToDestination"] = route_info.get('distanceMeters', 0)
            
        print("success - calculated all travel times")
        return candidates

    except requests.exceptions.RequestException as e:
        print(f"routes api error: {e}")
        print("api response:", response.text)
        return []

def find_chargers_by_travel_time(api_key, address, max_travel_seconds, max_radius):

    location = get_coordinates(api_key, address)
    if not location:
        return []
    
    candidate_chargers = find_candidate_chargers(api_key, location, max_radius)
    if not candidate_chargers:
        return []
        
    chargers_with_times = get_travel_times(api_key, location, candidate_chargers)
    if not chargers_with_times:
        return []
        
    print(f"filtering for chargers within {max_travel_seconds} seconds...")
    
    final_list = []
    for place in chargers_with_times:
        if "travelTimeSecondsWalkingToDestination" in place and place["travelTimeSecondsWalkingToDestination"] <= max_travel_seconds:
            final_list.append(place)
            
    final_list.sort(key=lambda x: x.get("travelTimeSecondsWalkingToDestination", 9999))        

    if not final_list:
        chargers_with_times.sort(key=lambda x: x.get("travelTimeSecondsWalkingToDestination", 9999))    
        final_list = [chargers_with_times[0]]

    return final_list

