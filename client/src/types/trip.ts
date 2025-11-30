// Definition of TripPlan interface used for trip planning data
export interface TripPlan {
  latitude: number | null;
  longitude: number | null;
  city: string;
  location: string;
  destination: string;
  EVModel: string;
  minutesAtDestination: number;
  battery: number;
  temperature: number | null;
}
