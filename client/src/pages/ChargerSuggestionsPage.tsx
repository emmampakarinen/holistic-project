import { useEffect, useState } from "react";
import ChargerCard from "../components/ChargerCard";
import { mockChargers } from "../data/mockChargers";
import type { Charger } from "../types/charger";
import { Button, Grid, Typography } from "@mui/joy";
import {
  ArrowLeft,
  BatteryMedium,
  Clock3,
  MapPin,
  Thermometer,
} from "lucide-react";
import InfoCard from "../components/InfoCard";
import { useNavigate, useLocation } from "react-router-dom";
import type { TripPlan } from "../types/trip";

// the charger suggestions page that displays recommended chargers based on user input
export default function ChargerSuggestionsPage() {

  const location = useLocation();
  const navigate = useNavigate();

  const [chargers, setChargers] = useState<Charger[]>(location.state?.chargers || []);
  const [loading, setLoading] = useState(!location.state?.chargers);
  const [trip, setTrip] = useState<TripPlan | null>(null);

  useEffect(() => {
    const stateTrip = (location.state as { trip?: TripPlan })?.trip ?? null;
    setTrip(stateTrip);
  }, [location.state]);

  useEffect(() => {

    if (location.state?.chargers) {
      return;
    }

    async function fetchData() {
      try {

        setChargers(location.state.chargers);

        navigate(".", { 
            state: { ...location.state, chargers: location.state.chargers }, 
            replace: true 
        });

      } catch (err) {
        console.error("Failed to fetch chargers", err);
        setChargers(mockChargers);
      } finally {
        setLoading(false);
      }
    }

    if (location.state?.trip) {
        fetchData();
    }
  }, []);

  // for showing the stay duration in hours and minutes

  const stayText =
    trip != null
      ? `${Math.floor(trip.minutesAtDestination / 60)} h ${
          trip.minutesAtDestination % 60
        } min`
      : "-";

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Button
          size="sm"
          variant="plain"
          startDecorator={<ArrowLeft size={18} />}
          onClick={() => navigate("/app/planning")}
        >
          Back to Planning
        </Button>
        <div className="mb-6">
          <Typography level="h2" fontSize="2.2rem" fontWeight={700}>
            Recommended Chargers Near Your Destination
          </Typography>
          <Typography level="body-sm" className="text-slate-600 mt-1">
            Below are suggestions of chargers that match your stay duration at
            the destination.
          </Typography>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <InfoCard
            icon={<MapPin size={18} />}
            label="Destination"
            value={trip?.destination ?? "-"}
          />
          <InfoCard
            icon={<Clock3 size={18} />}
            label="Stay Duration"
            value={stayText}
          />
          <InfoCard
            icon={<BatteryMedium size={18} />}
            label="Current Battery"
            value={trip ? `${trip.battery}%` : "-"}
          />
          <InfoCard
            icon={<Thermometer size={18} />}
            label="Temperature"
            value={trip?.temperature != null ? `${trip.temperature} °C` : "N/A"}
          />
        </div>

        <div className="mt-8">
          {!loading && chargers && chargers.length > 0 && (
            <Grid container spacing={3}>
              {chargers.map((charger) => (
                <Grid xs={12} md={6} key={charger.id}>
                  <ChargerCard charger={charger} />
                </Grid>
              ))}
            </Grid>
          )}

          {!loading && chargers && chargers.length === 0 && (
            <div className="mt-4">
              <Typography level="body-md">
                No chargers found for this destination.
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
