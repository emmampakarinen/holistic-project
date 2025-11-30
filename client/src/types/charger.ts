// for charger suggestions page
export interface Charger {
  googleChargerId: string;
  batteryAtChargerNearDestination: number;
  displayName: {text: string};
  address: {text: string};
  websiteUri: {text: string};
  rating: number;
  googleMapsLink: {text: string};
  distanceMetersWalkingToDestination: number;
  travelTimeSecondsDrivingToCharger: number;
  travelTimeSecondsWalkingToDestination: number;
  chargerDeltaSeconds: number;
  maxChargeRateKw: number;
  totalTimeToChargeSeconds: number;
  totalTimeToChargeFormattedTime: number;
  type: string;
  chargingSpeed: "slow" | "fast";
}