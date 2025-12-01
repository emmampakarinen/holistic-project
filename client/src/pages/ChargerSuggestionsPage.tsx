import { useEffect, useState } from "react";
import ChargerCard from "../components/ChargerCard";
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

  const state = location.state as {
    trip?: TripPlan;
    chargers?: Charger[];
  } | null;

  const [chargers] = useState<Charger[]>(state?.chargers || []);
  const [trip] = useState<TripPlan | null>(state?.trip || null);

  // safety check - handle page refresh
  useEffect(() => {
    // redirect back to planning so they can fetch data again
    if (!trip || !state?.chargers) {
      console.warn("No trip data found in state. Redirecting to planning.");
      navigate("/app/planning", { replace: true });
    }
  }, [trip, state, navigate]);

  // navigation handler
  const handleViewDetails = (selectedCharger: Charger) => {
    const chargerData = selectedCharger;
    localStorage.setItem("chargerData", JSON.stringify(chargerData));

    navigate(`/app/charger/${selectedCharger.googleChargerId}`, {
      state: {
        charger: selectedCharger,
        trip: trip,
      },
    });
  };

  // helper for formatting duration
  const getDurationString = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h} h ${m} min`;
  };

  const stayText = trip ? getDurationString(trip.minutesAtDestination) : "-";

  const loading = !trip;

  if (!trip) return null; // prevent rendering while redirecting

  return (
    <div className="bg-[#f4f6fb] flex-1 flex flex-col">
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
                <Grid xs={12} md={6} key={charger.googleChargerId}>
                  <ChargerCard
                    charger={charger}
                    onSelect={() => handleViewDetails(charger)}
                  />
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
