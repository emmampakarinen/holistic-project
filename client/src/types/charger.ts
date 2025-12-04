// for charger suggestions page
export interface Charger {
  googleChargerId: string;
  batteryAtChargerNearDestination: number;
  displayName: { text: string };
  address: { text: string };
  websiteUri: string;
  rating: number;
  googleMapsLink: string;
  distanceMetersWalkingToDestination: number;
  travelTimeSecondsDrivingToCharger: number;
  travelTimeSecondsWalkingToDestination: number;
  chargerDeltaSeconds: number;
  maxChargeRateKw: number;
  totalTimeToChargeSeconds: number;
  totalTimeToChargeFormattedTime: number;
  type: string;
  chargingSpeed: "slow" | "fast";
  reviews_count?: number;
}
