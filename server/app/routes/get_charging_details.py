import json
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request 
from app.services.handle_db_connections import create_conn, execute_insert, execute_select

bp = Blueprint("charging_details", __name__)
def get_charging_details():

    incoming_object = {
        "ev_name": "BMW iX xDrive45 (22 kW AC)",
        "chosen_charger_type": "CCS2",
        "car_start_charging_timestamp": "2025-11-28 09:30:59",
        "fetching_timestamp": "2025-11-28 10:08:59",
        "expected_charging_time": "2838.48",
    }
    
    ev_name = incoming_object.get("ev_name")

    connection = create_conn()

    query = """
    SELECT * FROM ev_charger_analysis 
    WHERE ev_name = %s
    """

    try:
        result = execute_select(connection, query, (ev_name,))        
        if not result:
            return jsonify({"error": "User not found"}), 404
        #return jsonify(result[0]), 200
    except Exception as e:
        print(e)
        pass
        #return jsonify({"error": str(e)}), 500

    # transform timestamps to seconds

    def parse_time_to_seconds(time_str):
        if ' ' in time_str:
            time_str = time_str.split(' ')[1]
        h, m, s = map(int, time_str.split(':'))
        return h * 3600 + m * 60 + s

    # request time diff

    difference_seconds = parse_time_to_seconds(incoming_object.get("fetching_timestamp")) - parse_time_to_seconds(incoming_object.get("car_start_charging_timestamp"))

    if incoming_object.get("chosen_charger_type") == result[0].get("dc_default_charger_type"):

        fmt = "%Y-%m-%d %H:%M:%S"
        curve_data = result[0].get('dc_charging_curve_data').get('charging_curve')
        
        t_start = datetime.strptime(incoming_object.get("car_start_charging_timestamp"), fmt)
        expected_duration = float(incoming_object.get("expected_charging_time"))
        
        # finish timestamp
        t_finish = t_start + timedelta(seconds=expected_duration)
        finish_timestamp_str = t_finish.strftime(fmt)

        # remaining time
        time_remaining_seconds = expected_duration - difference_seconds
        if time_remaining_seconds < 0: time_remaining_seconds = 0

        # format remaining time
        minutes, seconds = divmod(time_remaining_seconds, 60)
        hours, minutes = divmod(minutes, 60)
        formatted_time_remaining = f"{int(hours):02}:{int(minutes):02}:{int(seconds):02}"

        # find the end of the curve (100% mark)
        last_point = curve_data[-1] 
        curve_total_seconds = parse_time_to_seconds(last_point['time'])

        # determine virtual positions on the curve
        # position now = total curve time - time remaining
        target_curve_seconds = curve_total_seconds - time_remaining_seconds
        
        # position start = position now - time elapsed
        start_curve_seconds = target_curve_seconds - difference_seconds
        
        if target_curve_seconds < 0: target_curve_seconds = 0
        if start_curve_seconds < 0: start_curve_seconds = 0

        current_point = None
        start_point = None
        
        min_diff_current = float('inf')
        min_diff_start = float('inf')

        # single loop to find both the start status and current status
        for point in curve_data:
            point_seconds = parse_time_to_seconds(point['time'])
            
            # check if this is the closest to where we are now
            diff_curr = abs(target_curve_seconds - point_seconds)
            if diff_curr < min_diff_current:
                min_diff_current = diff_curr
                current_point = point
                
            # check if this is the closest to where we started
            diff_start = abs(start_curve_seconds - point_seconds)
            if diff_start < min_diff_start:
                min_diff_start = diff_start
                start_point = point

        # total energy is simply the energy at the current point
        # (assuming curve data energy_charged represents cumulative energy from 0%)
        current_total_energy = float(current_point.get('energy_charged', 0))
        
        # session energy = total now - total at start
        start_total_energy = float(start_point.get('energy_charged', 0))
        energy_charged_session = current_total_energy - start_total_energy

        if energy_charged_session < 0: energy_charged_session = 0

        closest_point = {
            "soc": int(current_point.get('soc')),
            "time_remaining_formatted": formatted_time_remaining, 
            "time_remaining_seconds": int(time_remaining_seconds),
            "charging_finish_timestamp": finish_timestamp_str,
            "total_energy": round(current_total_energy, 2),        
            "energy_charged": round(energy_charged_session, 2),
            "current_charging_speed": float(current_point.get('speed'))      
        }

    elif incoming_object.get("chosen_charger_type") == result[0].get("ac_default_charger_type"):
        
        ev_data = result[0]
        fmt = "%Y-%m-%d %H:%M:%S"
        
        max_capacity = float(ev_data.get('max_capacity'))
        effective_ac_rate = float(ev_data.get('ac_max_charge_rate'))
        
        # calculate finish timestamp
        t_start = datetime.strptime(incoming_object.get("car_start_charging_timestamp"), fmt)
        expected_duration = float(incoming_object.get("expected_charging_time"))
        
        t_finish = t_start + timedelta(seconds=expected_duration)
        finish_timestamp_str = t_finish.strftime(fmt)

        # calculate remaining time
        time_remaining_seconds = expected_duration - difference_seconds
        if time_remaining_seconds < 0: 
            time_remaining_seconds = 0

        # format remaining time (hh:mm:ss)
        minutes, seconds = divmod(time_remaining_seconds, 60)
        hours, minutes = divmod(minutes, 60)
        formatted_time_remaining = f"{int(hours):02}:{int(minutes):02}:{int(seconds):02}"

        # energy added this session (based on elapsed time)
        elapsed_hours = difference_seconds / 3600.0
        energy_charged_session = effective_ac_rate * elapsed_hours

        # energy missing to reach 100% (based on remaining time)
        energy_missing = effective_ac_rate * (time_remaining_seconds / 3600.0)

        # current total energy (max - missing)
        current_total_energy = max_capacity - energy_missing

        if current_total_energy > max_capacity: current_total_energy = max_capacity
        if current_total_energy < 0: current_total_energy = 0

        current_soc = (current_total_energy / max_capacity) * 100

        if current_soc > 100: current_soc = 100
        if current_soc < 0: current_soc = 0

        closest_point = {
            "soc": int(current_soc),
            "time_remaining_formatted": formatted_time_remaining, 
            "time_remaining_seconds": int(time_remaining_seconds),
            "charging_finish_timestamp": finish_timestamp_str,
            "total_energy": round(current_total_energy, 2),        
            "energy_charged": round(energy_charged_session, 2),
            "current_charging_speed": effective_ac_rate      
        }
    
    #closest_point["time_remaining"] = round(time_remaining / 60)
    charging_progress_data = closest_point
    print(charging_progress_data)