import type { Charger } from "../types/charger";

export const mockChargers: Charger[] = [
  {
    id: "1",
    name: "GreenCharge Station A",
    distanceKm: 0.3,
    powerOutputKw: 7.4,
    connectorType: "Type 2",
    estimatedChargeTime: "1h 45m",
    type: "slow",
  },
  {
    id: "2",
    name: "EcoCharge Hub B",
    distanceKm: 0.5,
    powerOutputKw: 11,
    connectorType: "Type 2",
    estimatedChargeTime: "1h 20m",
    type: "slow",
  },
  {
    id: "3",
    name: "PowerPoint Station C",
    distanceKm: 0.7,
    powerOutputKw: 7.4,
    connectorType: "Type 2",
    estimatedChargeTime: "1h 50m",
    type: "slow",
  },
  {
    id: "4",
    name: "City Charge Point D",
    distanceKm: 0.9,
    powerOutputKw: 11,
    connectorType: "Type 2",
    estimatedChargeTime: "1h 25m",
    type: "slow",
  },
];
