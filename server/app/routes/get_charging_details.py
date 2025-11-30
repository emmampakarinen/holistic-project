import json
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request 
from app.services.handle_db_connections import create_conn, execute_insert, execute_select

bp = Blueprint("charging_details", __name__)

@bp.route("/charging-details", methods=['POST'])
def get_charging_details():

    try:
        incoming_object = request.get_json()
        if not incoming_object:
            return jsonify({"error": "No JSON data provided"}), 400
    except:
        return jsonify({"error": "Invalid JSON format"}), 400
    
    print(incoming_object)

    ev_name = incoming_object.get("ev_name")
    
    # fetch db data
    connection = create_conn()
    query = """
    SELECT * FROM ev_charger_analysis 
    WHERE ev_name = %s
    """

    try:
        result = execute_select(connection, query, (ev_name,))        
        if not result:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

    ev_data = result[0]
    
    # parse timestamps and calculate elapsed time
    fmt = "%Y-%m-%d %H:%M:%S"
    try:
        t_start = datetime.strptime(incoming_object.get("car_start_charging_timestamp"), fmt)
        t_fetch = datetime.strptime(incoming_object.get("fetching_timestamp"), fmt)
        difference_seconds = (t_fetch - t_start).total_seconds()
        if difference_seconds < 0: difference_seconds = 0
    except ValueError:
        return jsonify({"error": "Invalid timestamp format"}), 400

    # get inputs
    station_power = float(incoming_object.get("charging_power", 0))
    start_soc = int(incoming_object.get("soc_at_charger", 0))
    chosen_type = incoming_object.get("chosen_charger_type")
    
    # variables to populate
    current_soc = start_soc
    energy_charged_session = 0.0
    current_total_energy = 0.0
    time_remaining_seconds = 0
    current_charging_speed = 0.0

    # dc charging
    if chosen_type == ev_data.get("dc_default_charger_type"):
        
        curve_wrapper = ev_data.get('dc_charging_curve_data')
        if isinstance(curve_wrapper, str):
            curve_wrapper = json.loads(curve_wrapper)
            
        curve_data = curve_wrapper.get('charging_curve')
        
        # calculate status now (simulate forward from start soc)
        elapsed_time_accumulated = 0
        
        # find start index
        start_index = next((i for i, item in enumerate(curve_data) if item["soc"] == start_soc), 0)
        start_db_energy = float(curve_data[start_index].get('energy_charged', 0))
        
        current_idx = start_index
        time_spent_in_current_step = 0.0 
        
        # iterate forward to find where we are now
        while current_idx < len(curve_data) - 1:
            step_start = curve_data[current_idx]
            step_end = curve_data[current_idx + 1]
            
            energy_step = float(step_end['energy_charged']) - float(step_start['energy_charged'])
            max_car_speed_at_step = float(step_start['speed'])
            
            # constrain by station power
            effective_speed = min(max_car_speed_at_step, station_power)
            if effective_speed <= 0: effective_speed = 1
            
            # time to cross this 1% gap
            time_for_step = (energy_step / effective_speed) * 3600
            
            if elapsed_time_accumulated + time_for_step <= difference_seconds:
                # we completed this whole step
                elapsed_time_accumulated += time_for_step
                energy_charged_session += energy_step
                current_idx += 1
                current_soc = step_end['soc']
                current_charging_speed = effective_speed
            else:
                # we are mid-way through this step
                remaining_time_budget = difference_seconds - elapsed_time_accumulated
                
                # capture exactly how many seconds we spent in this specific 
                time_spent_in_current_step = remaining_time_budget 
                
                fraction = remaining_time_budget / time_for_step
                energy_charged_session += (energy_step * fraction)
                current_charging_speed = effective_speed
                break
        
        current_total_energy = start_db_energy + energy_charged_session

        # calculate time remaining (simulate from now to 100%)
        # we start calculating remaining time from the current index
        sim_idx = current_idx
        
        while sim_idx < len(curve_data) - 1:
            step_start = curve_data[sim_idx]
            step_end = curve_data[sim_idx + 1]
            
            energy_step = float(step_end['energy_charged']) - float(step_start['energy_charged'])
            max_car_speed_at_step = float(step_start['speed'])
            effective_speed = min(max_car_speed_at_step, station_power)
            if effective_speed <= 0: effective_speed = 1
            
            time_for_step = (energy_step / effective_speed) * 3600
            
            # if this is the first step of the remaining loop, we subtract the time we already spent in it
            if sim_idx == current_idx:
                remaining_in_step = time_for_step - time_spent_in_current_step
                if remaining_in_step < 0: remaining_in_step = 0
                time_remaining_seconds += remaining_in_step
            else:
                # for all future steps, add full time
                time_remaining_seconds += time_for_step
            
            sim_idx += 1

    # ac charging
    elif chosen_type == ev_data.get("ac_default_charger_type"):
        
        max_capacity = float(ev_data.get('max_capacity'))
        ac_max_rate = float(ev_data.get('ac_max_charge_rate'))
        
        # effective speed is limited by obc or station
        effective_ac_rate = min(ac_max_rate, station_power)
        current_charging_speed = effective_ac_rate
        
        # calculate energy at start
        energy_at_start = max_capacity * (start_soc / 100.0)
        
        # calculate energy added
        elapsed_hours = difference_seconds / 3600.0
        energy_charged_session = effective_ac_rate * elapsed_hours
        
        # update totals
        current_total_energy = energy_at_start + energy_charged_session
        
        # cap at max
        if current_total_energy >= max_capacity:
            current_total_energy = max_capacity
            current_soc = 100
            time_remaining_seconds = 0
            energy_charged_session = max_capacity - energy_at_start
        else:
            current_soc = (current_total_energy / max_capacity) * 100
            # time remaining
            energy_needed = max_capacity - current_total_energy
            if effective_ac_rate > 0:
                time_remaining_seconds = (energy_needed / effective_ac_rate) * 3600
            else:
                time_remaining_seconds = 0
                
    else:
        # fallback if charger type matches neither
        return jsonify({"error": "Charger type mismatch"}), 400
    
    # calculate timestamps
    t_finish = datetime.now() + timedelta(seconds=time_remaining_seconds) # rough estimate based on now + remaining
    # or strictly based on fetch time:
    t_finish = t_fetch + timedelta(seconds=time_remaining_seconds)
    finish_timestamp_str = t_finish.strftime(fmt)

    minutes, seconds = divmod(int(time_remaining_seconds), 60)
    hours, minutes = divmod(minutes, 60)
    formatted_time_remaining = f"{hours:02}:{minutes:02}:{seconds:02}"

    closest_point = {
        "soc": int(current_soc),
        "time_remaining_formatted": formatted_time_remaining, 
        "time_remaining_seconds": int(time_remaining_seconds),
        "charging_finish_timestamp": finish_timestamp_str,
        "total_energy": round(current_total_energy, 2),        
        "energy_charged": round(energy_charged_session, 2),
        "current_charging_speed": round(current_charging_speed, 2)      
    }

    charging_progress_data = closest_point
    print(charging_progress_data)

    return charging_progress_data