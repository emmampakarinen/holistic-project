import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Button, Card, CardContent } from "@mui/joy";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import RatingForm from "../components/RatingForm";

import { ArrowLeft, Clock, Navigation, Calendar, Info } from "lucide-react";
import { Zap } from "lucide-react";
import type { Charger } from "../types/charger";
import { ChargerSpecCard } from "../components/ChargerSpecCard";
//import { time } from "console";

const API_URL = import.meta.env.VITE_API_URL;

// formats date as "yyyy-mm-dd hh:mm:ss"
const formatToPythonString = (date: Date) => {
  return date.toLocaleString("sv-SE").replace("T", " ");
};

const ChargerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const userId = localStorage.getItem("google_sub");

  // get charger data
  const charger = location.state?.charger as Charger;

  // handle missing data (refresh protection)
  if (!charger) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <h2 className="text-xl font-bold text-red-600">Charger Not Found</h2>
        <p className="text-muted-foreground">
          Session data was lost (likely due to a refresh).
        </p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate("app/planning")}
        >
          Back to Planning
        </button>
      </div>
    );
  }

  // start charging handler
  const handleStartCharging = async () => {
    try {
      // generate timestamps
      const nowObject = new Date();
      const timestampString = formatToPythonString(nowObject);

      const storedPlan = localStorage.getItem("currentTripPlan");
      const tripData = storedPlan ? JSON.parse(storedPlan) : {};

      const trip_history_payload = {
        starting_points: tripData.location,
        ending_points: tripData.destination,
        car_start_charging_timestamp: timestampString,
        expected_charging_time: charger?.totalTimeToChargeSeconds || 0,
        user_id: localStorage.getItem("google_sub"),
      };

      // const response_history = await fetch(

      await fetch(`${API_URL}/save-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trip_history_payload),
      });

      // save session info to localStorage
      // note: we overwrite active_session_start here because a new session is starting.
      localStorage.setItem("activeSessionStart", timestampString);

      // build payload
      const payload = {
        ev_name: localStorage.getItem("EVModel") || "Unknown EV",
        chosen_charger_type: charger?.type || "Unknown Connector",
        soc_at_charger: charger?.batteryAtChargerNearDestination,
        charging_power: charger?.maxChargeRateKw,
        car_start_charging_timestamp: timestampString,
        fetching_timestamp: timestampString,
        expected_charging_time: charger?.totalTimeToChargeSeconds || 0,
      };

      console.log("sending to backend:", payload);

      // send request
      const response = await fetch(`${API_URL}/charging-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      localStorage.setItem("activeChargerSession", JSON.stringify(data));

      // handle response
      if (response.ok && !data.error) {
        console.log("received from backend:", data);

        // navigate on success
        navigate(`/app/charging/${id}`, {
          state: {
            charger: charger,
            sessionData: data,
            currentPayload: payload,
          },
        });
      } else {
        console.error("backend error:", data.error);
        alert(`error starting session: ${data.error || "unknown error"}`);
      }
    } catch (err) {
      console.error("network error:", err);
      alert("network error, please check your connection");
    }
  };

  // Helper function to extract lat/lng from Google Maps link
  const getLatLngFromGoogleMapsLink = (link: string) => {
    try {
      const url = new URL(link);
      const params = url.searchParams;
      const destination = params.get("destination"); // ex: "60.16777,24.9415428"
      if (!destination) return null;
      const [lat, lng] = destination.split(",").map(Number);
      return { lat, lng };
    } catch (err) {
      console.error("Invalid Google Maps link", err);
      return null;
    }
  };

  // Extract charger coordinates
  const chargerCoords = getLatLngFromGoogleMapsLink(charger.googleMapsLink);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (loadError) return <p>Error loading Google Maps</p>;
  if (!isLoaded) return <p>Loading map...</p>;
  if (!chargerCoords) return <p>Cannot get charger location</p>;

  return (
    <div className="bg-background bg-[#f4f6fb]  flex flex-col p-5">
      {/* Main Content */}
      <div className="mx-auto max-w-7xl">
        <Button
          size="sm"
          variant="plain"
          startDecorator={<ArrowLeft size={18} />}
          onClick={() => navigate(-1)}
          sx={{ marginBottom: 2 }}
        >
          Back to Results
        </Button>
        {/* Station Header */}
        <p className="text-2xl sm:text-3xl font-bold mb-4">
          {charger?.displayName?.text}
        </p>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-80 rounded-lg overflow-hidden">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={chargerCoords}
                zoom={16}
              >
                <Marker position={chargerCoords} />
              </GoogleMap>
            </div>

            {/* Charger Specifications */}
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Charger Specifications
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <ChargerSpecCard
                  title="Charger type"
                  Icon={Zap}
                  value={charger.type}
                />
                <ChargerSpecCard
                  title="Power Output"
                  Icon={Zap}
                  value={charger.maxChargeRateKw}
                />
                <ChargerSpecCard
                  title="Est. Charge Time"
                  Icon={Clock}
                  value={charger.totalTimeToChargeFormattedTime}
                />
              </div>
            </div>

            {/* Perfect Match Info */}
            <Card variant="outlined" className="border-0">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <div className=" p-2 rounded-full h-fit">
                    <Info className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      Perfect Match for Your Trip
                    </h3>
                    <p className="text-muted-foreground">
                      This slow charger is ideal for your{" "}
                      {localStorage.getItem("hours")}h{" "}
                      {localStorage.getItem("minutes")} min destination stay.
                      Your vehicle will be fully charged by the time you're
                      ready to leave.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            {/* Quick Actions */}
            <Card className="border-0">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                <div className="flex flex-col gap-2">
                  <Button
                    sx={{
                      width: "100%",
                      height: "48px",
                      backgroundColor: "#22c55e",
                      color: "white",
                      borderRadius: "12px",
                      fontSize: "16px",
                      "&:hover": {
                        backgroundColor: "#16a34a",
                      },
                    }}
                    onClick={handleStartCharging}
                  >
                    Start Charging
                  </Button>
                  <div className="flex flex-row gap-2">
                    <Button
                      variant="solid"
                      className="w-full h-12"
                      component="a"
                      href={charger.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      startDecorator={<Navigation className="mr-2 h-5 w-5" />} // Joy UI
                    >
                      Navigate to Charger
                    </Button>
                    <Button
                      variant="solid"
                      className="w-full h-12"
                      component="a"
                      href={charger.websiteUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      startDecorator={<Calendar className="h-5 w-5" />} // Joy UI
                    >
                      Book Charger
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <RatingForm
              googleChargerId={charger.googleChargerId}
              userId={userId}
              existingRating={charger?.rating}
              // onSubmitSuccess={refreshChargerData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargerDetails;
