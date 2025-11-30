import os
from flask import Blueprint, jsonify, request 
from app.services.receive_weather_info import get_latest_weather
from app.services.receive_ev_chargers import find_chargers_by_travel_time
from app.services.route_service import fetch_drive_metrics
from app.services.handle_db_connections import create_conn, execute_insert, execute_select

bp = Blueprint("logic", __name__)

@bp.route("/find-charger", methods=['POST'])
def find_charge():

    # format from front-end

    '''
    {
        "EVModel": "BMW iX xDrive45 (11 kW AC)",
        "battery": 100,
        "destination": "Radio iela 8, Liepāja, LV-3401",
        "latitude": 56.9540608,
        "location": "Riga",
        "longitude": 24.117248,
        "minutesAtDestination": 120,
        "temperature": 2.9
    }
    '''

    try:
        core_info = request.get_json()
        if not core_info:
            return jsonify({"error": "No JSON data provided"}), 400
    except:
        return jsonify({"error": "Invalid JSON format"}), 400

    # key

    maps_api_key = os.getenv("GOOGLE_MAPS_PLATFORM_API_KEY", "key")

    # system inputs

    walk_limit_sec = 1200 # maximum allowed walking time from the charger to the destination (20 minutes)
    search_radius_m = 1500 # the maximum physical radius (in meters) to search for chargers around the destination

    # user inputs

    user_lat = core_info.get('latitude')
    user_lng = core_info.get('longitude')
    user_coords = {'lat': user_lat, 'lng': user_lng}
    dest_addr = core_info.get('destination')
    vehicle_model = core_info.get('EVModel')
    stay_duration_sec = core_info.get('minutesAtDestination') * 60
    start_battery_pct = core_info.get('battery')

    '''
    user_lat = 60.170363
    user_lng = 24.941479
    user_coords = {'lat': user_lat, 'lng': user_lng}
    dest_addr = "Mukkulankatu 19, 15210 Lahti, Finland"
    vehicle_model = "BMW iX xDrive45 (11 kW AC)"
    stay_duration_sec = 18000 # the total duration the user intends to stay at the destination (5 hours)
    start_battery_pct = 100 # the current battery level of the vehicle before starting the trip (in percentage)
    '''
    
    ####################################
    
    db_conn = create_conn() # Establish a connection to the database.

    sql_query = """
    SELECT * FROM ev_charger_analysis WHERE ev_name = %s
    """

    query_params = (vehicle_model,)

    vehicle_specs = execute_select(db_conn, sql_query, query_params)[0]

    # example data structure (commented out for validity)
    
    {
        'ev_name': 'BMW iX xDrive45 (11 kW AC)',
        'max_capacity': '94.8 kWh',
        'dc_max_charge_rate': '175 kW',
        'ac_max_charge_rate': '11 kW',
        'dc_default_charger_type': 'CCS2',
        'ac_default_charger_type': 'Type2',
        'dc_charging_curve_data': [{'soc': 0, 'speed': 50, 'time': '00:00:00', 'energy_charged': 0.0}, {'soc': 1, 'speed': 80, 'time': '00:00:56', 'energy_charged': 0.9}, {'soc': 2, 'speed': 100, 'time': '00:01:37', 'energy_charged': 1.9}, {'soc': 3, 'speed': 121, 'time': '00:02:10', 'energy_charged': 2.8}, {'soc': 4, 'speed': 155, 'time': '00:02:37', 'energy_charged': 3.8}, {'soc': 5, 'speed': 156, 'time': '00:03:00', 'energy_charged': 4.7}, {'soc': 6, 'speed': 157, 'time': '00:03:24', 'energy_charged': 5.7}, {'soc': 7, 'speed': 170, 'time': '00:03:46', 'energy_charged': 6.6}, {'soc': 8, 'speed': 171, 'time': '00:04:08', 'energy_charged': 7.6}, {'soc': 9, 'speed': 171, 'time': '00:04:29', 'energy_charged': 8.5}, {'soc': 10, 'speed': 171, 'time': '00:04:50', 'energy_charged': 9.5}, {'soc': 11, 'speed': 171, 'time': '00:05:12', 'energy_charged': 10.4}, {'soc': 12, 'speed': 171, 'time': '00:05:33', 'energy_charged': 11.4}, {'soc': 13, 'speed': 171, 'time': '00:05:55', 'energy_charged': 12.3}, {'soc': 14, 'speed': 171, 'time': '00:06:16', 'energy_charged': 13.3}, {'soc': 15, 'speed': 171, 'time': '00:06:38', 'energy_charged': 14.2}, {'soc': 16, 'speed': 172, 'time': '00:06:59', 'energy_charged': 15.2}, {'soc': 17, 'speed': 172, 'time': '00:07:21', 'energy_charged': 16.1}, {'soc': 18, 'speed': 172, 'time': '00:07:42', 'energy_charged': 17.1}, {'soc': 19, 'speed': 172, 'time': '00:08:03', 'energy_charged': 18.0}, {'soc': 20, 'speed': 171, 'time': '00:08:25', 'energy_charged': 19.0}, {'soc': 21, 'speed': 171, 'time': '00:08:46', 'energy_charged': 19.9}, {'soc': 22, 'speed': 171, 'time': '00:09:07', 'energy_charged': 20.9}, {'soc': 23, 'speed': 171, 'time': '00:09:29', 'energy_charged': 21.8}, {'soc': 24, 'speed': 171, 'time': '00:09:50', 'energy_charged': 22.8}, {'soc': 25, 'speed': 171, 'time': '00:10:12', 'energy_charged': 23.7}, {'soc': 26, 'speed': 172, 'time': '00:10:33', 'energy_charged': 24.6}, {'soc': 27, 'speed': 172, 'time': '00:10:55', 'energy_charged': 25.6}, {'soc': 28, 'speed': 172, 'time': '00:11:16', 'energy_charged': 26.5}, {'soc': 29, 'speed': 172, 'time': '00:11:37', 'energy_charged': 27.5}, {'soc': 30, 'speed': 172, 'time': '00:11:59', 'energy_charged': 28.4}, {'soc': 31, 'speed': 173, 'time': '00:12:20', 'energy_charged': 29.4}, {'soc': 32, 'speed': 173, 'time': '00:12:41', 'energy_charged': 30.3}, {'soc': 33, 'speed': 173, 'time': '00:13:02', 'energy_charged': 31.3}, {'soc': 34, 'speed': 173, 'time': '00:13:24', 'energy_charged': 32.2}, {'soc': 35, 'speed': 173, 'time': '00:13:45', 'energy_charged': 33.2}, {'soc': 36, 'speed': 173, 'time': '00:14:06', 'energy_charged': 34.1}, {'soc': 37, 'speed': 174, 'time': '00:14:27', 'energy_charged': 35.1}, {'soc': 38, 'speed': 174, 'time': '00:14:48', 'energy_charged': 36.0}, {'soc': 39, 'speed': 174, 'time': '00:15:09', 'energy_charged': 37.0}, {'soc': 40, 'speed': 175, 'time': '00:15:30', 'energy_charged': 37.9}, {'soc': 41, 'speed': 175, 'time': '00:15:51', 'energy_charged': 38.9}, {'soc': 42, 'speed': 173, 'time': '00:16:12', 'energy_charged': 39.8}, {'soc': 43, 'speed': 165, 'time': '00:16:34', 'energy_charged': 40.8}, {'soc': 44, 'speed': 164, 'time': '00:16:56', 'energy_charged': 41.7}, {'soc': 45, 'speed': 158, 'time': '00:17:19', 'energy_charged': 42.7}, {'soc': 46, 'speed': 156, 'time': '00:17:43', 'energy_charged': 43.6}, {'soc': 47, 'speed': 157, 'time': '00:18:06', 'energy_charged': 44.6}, {'soc': 48, 'speed': 157, 'time': '00:18:29', 'energy_charged': 45.5}, {'soc': 49, 'speed': 148, 'time': '00:18:53', 'energy_charged': 46.5}, {'soc': 50, 'speed': 149, 'time': '00:19:18', 'energy_charged': 47.4}, {'soc': 51, 'speed': 149, 'time': '00:19:43', 'energy_charged': 48.3}, {'soc': 52, 'speed': 143, 'time': '00:20:08', 'energy_charged': 49.3}, {'soc': 53, 'speed': 143, 'time': '00:20:34', 'energy_charged': 50.2}, {'soc': 54, 'speed': 134, 'time': '00:21:00', 'energy_charged': 51.2}, {'soc': 55, 'speed': 135, 'time': '00:21:27', 'energy_charged': 52.1}, {'soc': 56, 'speed': 135, 'time': '00:21:55', 'energy_charged': 53.1}, {'soc': 57, 'speed': 128, 'time': '00:22:22', 'energy_charged': 54.0}, {'soc': 58, 'speed': 129, 'time': '00:22:51', 'energy_charged': 55.0}, {'soc': 59, 'speed': 130, 'time': '00:23:19', 'energy_charged': 55.9}, {'soc': 60, 'speed': 130, 'time': '00:23:48', 'energy_charged': 56.9}, {'soc': 61, 'speed': 131, 'time': '00:24:16', 'energy_charged': 57.8}, {'soc': 62, 'speed': 126, 'time': '00:24:44', 'energy_charged': 58.8}, {'soc': 63, 'speed': 127, 'time': '00:25:13', 'energy_charged': 59.7}, {'soc': 64, 'speed': 126, 'time': '00:25:42', 'energy_charged': 60.7}, {'soc': 65, 'speed': 122, 'time': '00:26:12', 'energy_charged': 61.6}, {'soc': 66, 'speed': 122, 'time': '00:26:42', 'energy_charged': 62.6}, {'soc': 67, 'speed': 118, 'time': '00:27:13', 'energy_charged': 63.5}, {'soc': 68, 'speed': 117, 'time': '00:27:44', 'energy_charged': 64.5}, {'soc': 69, 'speed': 114, 'time': '00:28:16', 'energy_charged': 65.4}, {'soc': 70, 'speed': 113, 'time': '00:28:48', 'energy_charged': 66.4}, {'soc': 71, 'speed': 111, 'time': '00:29:21', 'energy_charged': 67.3}, {'soc': 72, 'speed': 109, 'time': '00:29:54', 'energy_charged': 68.3}, {'soc': 73, 'speed': 109, 'time': '00:30:28', 'energy_charged': 69.2}, {'soc': 74, 'speed': 107, 'time': '00:31:02', 'energy_charged': 70.2}, {'soc': 75, 'speed': 105, 'time': '00:31:36', 'energy_charged': 71.1}, {'soc': 76, 'speed': 100, 'time': '00:32:12', 'energy_charged': 72.0}, {'soc': 77, 'speed': 93, 'time': '00:32:50', 'energy_charged': 73.0}, {'soc': 78, 'speed': 93, 'time': '00:33:30', 'energy_charged': 73.9}, {'soc': 79, 'speed': 79, 'time': '00:34:12', 'energy_charged': 74.9}, {'soc': 80, 'speed': 88, 'time': '00:34:56', 'energy_charged': 75.8}, {'soc': 81, 'speed': 80, 'time': '00:35:40', 'energy_charged': 76.8}, {'soc': 82, 'speed': 80, 'time': '00:36:26', 'energy_charged': 77.7}, {'soc': 83, 'speed': 80, 'time': '00:37:12', 'energy_charged': 78.7}, {'soc': 84, 'speed': 80, 'time': '00:37:57', 'energy_charged': 79.6}, {'soc': 85, 'speed': 80, 'time': '00:38:43', 'energy_charged': 80.6}, {'soc': 86, 'speed': 80, 'time': '00:39:29', 'energy_charged': 81.5}, {'soc': 87, 'speed': 65, 'time': '00:40:20', 'energy_charged': 82.5}, {'soc': 88, 'speed': 69, 'time': '00:41:15', 'energy_charged': 83.4}, {'soc': 89, 'speed': 68, 'time': '00:42:08', 'energy_charged': 84.4}, {'soc': 90, 'speed': 69, 'time': '00:43:02', 'energy_charged': 85.3}, {'soc': 91, 'speed': 69, 'time': '00:43:55', 'energy_charged': 86.3}, {'soc': 92, 'speed': 69, 'time': '00:44:48', 'energy_charged': 87.2}, {'soc': 93, 'speed': 69, 'time': '00:45:41', 'energy_charged': 88.2}, {'soc': 94, 'speed': 68, 'time': '00:46:35', 'energy_charged': 89.1}, {'soc': 95, 'speed': 59, 'time': '00:47:33', 'energy_charged': 90.1}, {'soc': 96, 'speed': 63, 'time': '00:48:33', 'energy_charged': 91.0}, {'soc': 97, 'speed': 63, 'time': '00:49:31', 'energy_charged': 92.0}, {'soc': 98, 'speed': 64, 'time': '00:50:29', 'energy_charged': 92.9}, {'soc': 99, 'speed': 36, 'time': '00:51:42', 'energy_charged': 93.9}, {'soc': 100, 'speed': 5, 'time': '00:54:41', 'energy_charged': 94.8}]
    } 
    
    # we get the chargers that are within max drive time
    nearby_chargers = find_chargers_by_travel_time(maps_api_key, dest_addr, walk_limit_sec, search_radius_m)

    # find time it takes to drive to the specific found chargers
    route_stats = fetch_drive_metrics(maps_api_key, user_coords, nearby_chargers)

    for charger_stat in route_stats:
        charger_stat["travelTimeSecondsDrivingToCharger"]
        # calculate energy consumed (in kWh) based on distance driven and WLTP range.
        trip_energy_kwh = ((charger_stat.get("distanceMetersDrivingToCharger") / 1000) / 100) * vehicle_specs.get('wltp_range')
        # convert energy consumed into a percentage loss of the total battery capacity.
        soc_loss_pct = (trip_energy_kwh / vehicle_specs.get('max_capacity')) * 100
        arrival_soc = start_battery_pct - soc_loss_pct
        charger_stat["battery_at_charger_near_destination"] = arrival_soc

    if arrival_soc < 5:
        return {"error": "can't reach charger"}

    ####################################

    connector_map = {"EV_CONNECTOR_TYPE_CHADEMO": "CHAdeMO", "EV_CONNECTOR_TYPE_CCS_COMBO_2": "CCS2", "EV_CONNECTOR_TYPE_TYPE_2": "Type2"}

    rev_conn_map = {v: k for k, v in connector_map.items()}
    
    curr_dc_std = vehicle_specs['dc_default_charger_type']
    vehicle_specs['dc_default_charger_type'] = rev_conn_map.get(curr_dc_std, curr_dc_std)
    
    curr_ac_std = vehicle_specs['ac_default_charger_type']
    vehicle_specs['ac_default_charger_type'] = rev_conn_map.get(curr_ac_std, curr_ac_std)

    if nearby_chargers:

        for charger in nearby_chargers:

            ####################################

            #weather_temp = get_latest_weather(maps_api_key, charger.get('location').get('latitude'), charger.get('location').get('longtitude')) # currently not used
            
            #temp_coeff = 1 # coefficient to adjust charging speed based on temperature (default is 1)

            ####################################

            # total trip time includes the stay at the destination plus walking to and from the charger
            total_trip_time = stay_duration_sec + charger.get("travelTimeSecondsWalkingToDestination") * 2

            for connector in charger.get('evChargeOptions').get('connectorAggregation'):

                if connector.get('availableCount') == 0:
                    continue

                charge_duration = 0.0

                if connector.get('type') == vehicle_specs.get("dc_default_charger_type"):

                    raw_curve_data = vehicle_specs.get('dc_charging_curve_data').get('charging_curve')
                    
                    start_soc = charger.get("battery_at_charger_near_destination")
                    end_soc = 100
                    
                    station_max_kw = connector.get('maxChargeRateKw') 
                    
                    ordered_curve = sorted(raw_curve_data, key = lambda x: x['soc'])
                    
                    for curve_point in ordered_curve:
                        if 'time_seconds' not in curve_point:
                            h, m, s = map(int, curve_point['time'].split(':'))
                            curve_point['time_seconds'] = h * 3600 + m * 60 + s

                    for idx in range(len(ordered_curve) - 1):
                        point_curr = ordered_curve[idx]
                        point_next = ordered_curve[idx+1]

                        seg_start_soc = point_curr['soc']
                        seg_end_soc = point_next['soc']

                        overlap_start = max(seg_start_soc, start_soc)
                        overlap_end = min(seg_end_soc, end_soc)

                        if overlap_end > overlap_start:
                            
                            seg_width = seg_end_soc - seg_start_soc
                            overlap_ratio = (overlap_end - overlap_start) / seg_width if seg_width > 0 else 0

                            full_energy_diff = point_next['energy_charged'] - point_curr['energy_charged']
                            full_time_diff = point_next['time_seconds'] - point_curr['time_seconds']

                            partial_energy = full_energy_diff * overlap_ratio
                            partial_time = full_time_diff * overlap_ratio

                            avg_req_power = (point_curr['speed'] + point_next['speed']) / 2.0
                            effective_power = min(avg_req_power, station_max_kw)

                            segment_duration = 0.0

                            if station_max_kw >= avg_req_power:
                                segment_duration = partial_time
                            else:
                                if effective_power > 0:
                                    segment_duration = (partial_energy / effective_power) * 3600

                            charge_duration += segment_duration

                    print(f"time to charge dc: {charge_duration:.2f} seconds")

                elif connector.get('type') == vehicle_specs.get("ac_default_charger_type"):

                    station_ac_limit = connector.get('maxChargeRateKw')
                    
                    vehicle_capacity = vehicle_specs.get('max_capacity')
                    vehicle_ac_limit = vehicle_specs.get('ac_max_charge_rate') 

                    effective_ac_rate = min(vehicle_ac_limit, station_ac_limit)

                    energy_needed = ((100 - charger.get("battery_at_charger_near_destination")) / 100) * vehicle_capacity

                    duration_hours = energy_needed / effective_ac_rate
                    charge_duration = duration_hours * 3600

                    print(f"time to charge ac: {charge_duration:.2f} seconds")
                
                connector['total_time_to_charge'] = charge_duration
                connector["charger_delta_seconds"] = abs(charge_duration - total_trip_time)

    # get best delta of all options

    min_time_diff = None
    best_charger_loc = None  
    best_connector_opt = None

    all_candidates = []

    for charger in nearby_chargers:
        conn_agg_list = charger.get('evChargeOptions', {}).get('connectorAggregation', [])        
        for connector in conn_agg_list:
            time_diff = connector.get('charger_delta_seconds')            
            if time_diff is not None:
                all_candidates.append({
                    "sort_key": time_diff, 
                    "charger": charger,  
                    "connector": connector
                })

    all_candidates.sort(key=lambda x: x['sort_key'])

    top_3_candidates = all_candidates[:3]
    final_results = []

    speed_category_map = {
        "EV_CONNECTOR_TYPE_TYPE_2": "slow",
        "EV_CONNECTOR_TYPE_CCS_COMBO_2": "fast",
        "EV_CONNECTOR_TYPE_CHADEMO": "fast"
    }

    for candidate in top_3_candidates:
        charger = candidate['charger']
        connector = candidate['connector']

        hours, remainder = divmod(connector.get("total_time_to_charge"), 3600)
        minutes = remainder // 60
        total_time_to_charge_formatted_time = f"{int(hours)}h {int(minutes)} min"

        charger = candidate['charger']
        connector = candidate['connector']
        raw_type = connector.get("type")

        formatted_entry = {
            "googleChargerId": charger.get('id'), 
            "batteryAtChargerNearDestination": round(charger.get("battery_at_charger_near_destination")),
            "displayName": charger.get("displayName"),
            "address": charger.get("formattedAddress"),
            "websiteUri": charger.get("websiteUri"),
            "rating": charger.get("rating"),
            "googleMapsLink": charger.get("googleMapsLink"),
            "distanceMetersDrivingToCharger": charger.get("distanceMetersDrivingToCharger"),
            "distanceMetersWalkingToDestination": charger.get("distanceMetersWalkingToDestination"),
            "travelTimeSecondsDrivingToCharger": charger.get("travelTimeSecondsDrivingToCharger"),
            "travelTimeSecondsWalkingToDestination": round((charger.get("travelTimeSecondsWalkingToDestination") / 60)),
            "chargerDeltaSeconds": connector.get("charger_delta_seconds"),
            "maxChargeRateKw": connector.get("maxChargeRateKw"),
            "totalTimeToChargeSeconds": connector.get("total_time_to_charge"),
            "totalTimeToChargeFormattedTime": total_time_to_charge_formatted_time,
            "type": connector_map.get(raw_type, raw_type),
            "chargingSpeed": speed_category_map.get(raw_type)
        }
        
        print(formatted_entry)
        
        final_results.append(formatted_entry)

    '''
    example output explanation:
    {
        "battery_at_charger_near_destination": 67.2, # the estimated battery percentage remaining when the car arrives at this charger
        "bestEvChargeOption": {                      # the specific connector selected as the optimal choice based on time calculations
            "charger_delta_seconds": 9784.9,           # the difference between the charging time and your total time spent at the destination (including walking)
            "maxChargeRateKw": 43,                     # the maximum power output (kW) supported by this specific connector
            "total_time_to_charge": 10175.1,           # the total time (seconds) required to charge the battery to 100% from its arrival level
            "type": "EV_CONNECTOR_TYPE_TYPE_2"         # the technical type of the plug/connector (e.g., Type 2 for AC charging)
        },
        "displayName": {...},                        # the public name of the charging station (e.g., "CSDD Charging Station")
        "distanceMetersDrivingToCharger": 215159,    # the driving distance in meters from your current location to this charger
        "distanceMetersWalkingToDestination": 1192,  # the walking distance in meters from this charger to your final destination address
        "travelTimeSecondsDrivingToCharger": 10198,  # the estimated time in seconds it takes to drive to this charger
        "travelTimeSecondsWalkingToDestination": 980 # the estimated time in seconds it takes to walk from this charger to your final destination
    }
    '''

    return final_results