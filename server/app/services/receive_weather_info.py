import requests

def get_latest_weather(maps_api_key, latitude, longitude):
    
    weather_api_url = "https://weather.googleapis.com/v1/currentConditions:lookup" # google maps weather api endpoint for current conditions

    query_parameters = {
        "key": maps_api_key, # the API key required to authenticate the request
        "location.latitude": latitude, # latitude coordinate of the location
        "location.longitude": longitude, # longitude coordinate of the location
        "unitsSystem": "METRIC" # use metric units (celsius) for the response
    }

    try:
        api_response = requests.get(weather_api_url, params=query_parameters) # send GET request to the Weather API
        api_response.raise_for_status() # check if the request was successful (status code 200)

        weather_data = api_response.json() # parse the JSON response containing weather details
        
        if "temperature" in weather_data and "degrees" in weather_data["temperature"]:
            # extract degrees and round to the nearest multiple of 5 (e.g., 23 becomes 25, 22 becomes 20)
            rounded_temperature = round(weather_data["temperature"]["degrees"] / 5) * 5
            return rounded_temperature # rReturn the processed temperature value
        else:
            print("Error: Could not find temperature data in the response.")
            print("Full response:", weather_data)
            return None

    except requests.exceptions.HTTPError as http_error:
        print(f"HTTP error occurred: {http_error}") # log specific HTTP errors (like 404 or 500)
        try:
            print("API Error:", api_response.json())
        except requests.exceptions.JSONDecodeError:
            print("API Error:", api_response.text)
        return None
    except Exception as unknown_error:
        print(f"An unknown error occurred: {unknown_error}") # catch and log any other unexpected errors
        return None