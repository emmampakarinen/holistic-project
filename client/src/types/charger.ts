// for charger suggestions page
export interface Charger {
  id: string;
  displayName: {text: string};
  distanceMetersWalkingToDestination: number;
  travelTimeSecondsWalkingToDestination: number;
  battery_at_charger_near_destination: number;
  bestEvChargeOption: {
    maxChargeRateKw: number;
    total_time_to_charge_formatted_time: number;
    type: string;
    charging_speed: "slow" | "fast";
  };
  total_time_to_charge_formatted_time: string;
}
