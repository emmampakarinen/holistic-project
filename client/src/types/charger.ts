// for charger suggestions page
export interface Charger {
  id: string;
  displayName: {text: string};
  distanceMetersWalkingToDestination: number;
  bestEvChargeOption: {
    maxChargeRateKw: number;
    type: string;
  };
  total_time_to_charge: string;
  type: "slow" | "fast";
}
