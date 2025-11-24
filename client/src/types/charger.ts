// for charger suggestions page
export interface Charger {
  id: string;
  name: string;
  distanceKm: number;
  powerOutputKw: number;
  connectorType: string;
  estimatedChargeTime: string;
  type: "slow" | "fast";
}
