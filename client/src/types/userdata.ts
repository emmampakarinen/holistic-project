export type StoredUserData = {
  created_at: string;
  email: string;
  name: string;
  user_id: string;
  googleUserId: string;
  ev_cars: { ev_name: string }[];
  trip_history: {
    car_start_charging_timestamp: string;
    ending_points: string;
    expected_charging_time: number;
    starting_points: string;
  }[];
};
