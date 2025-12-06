import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, Button } from "@mui/joy";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Clock, Battery, MapPin, Thermometer } from "lucide-react";
import { Zap } from "lucide-react";
import { ChargingInfoCard } from "../components/ChargingInfoCard";
import type { TripPlan } from "../types/trip";
import { ChargingDetails } from "../components/ChargingDetails";

const API_URL = import.meta.env.VITE_API_URL;

function getTemperatureColors(temp: number) {
  if (temp < 5) {
    return {
      bg: "from-blue-50 to-blue-100",
      text: "text-blue-600",
      iconBg: "bg-blue-200",
      icon: "text-blue-600",
    };
  }
  if (temp > 20) {
    return {
      bg: "from-orange-50 to-orange-100",
      text: "text-orange-600",
      iconBg: "bg-orange-200",
      icon: "text-orange-600",
    };
  }
  return {
    bg: "from-green-50 to-green-100",
    text: "text-green-600",
    iconBg: "bg-green-200",
    icon: "text-green-600",
  };
}

const formatToPythonString = (date: Date) => {
  return date.toLocaleString("sv-SE").replace("T", " ");
};

const ChargingProgress = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tripPlan] = useState<TripPlan | null>(() => {
    try {
      const raw = localStorage.getItem("currentTripPlan");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error("Failed to parse currentTripPlan from localStorage", e);
      return null;
    }
  });

  const [isStopping, setIsStopping] = useState(false);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      const savedCharger = localStorage.getItem("activeChargerSession");
      if (savedCharger) {
        handleChargingDataUpdate();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // initialize sharger state (try location first, then fallback to local storage)
  const [charger, _] = useState(() => {
    if (location.state?.charger) return location.state.charger;
    const saved = localStorage.getItem("active_charger");
    return saved ? JSON.parse(saved) : null;
  });

  const [activeChargingSessionData, setActiveSessionData] = useState<any>(
    location.state?.sessionData || null
  );

  const currentPayloads = location.state?.currentPayload;

  //feedback
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState<number | null>(null);

  // effect: security check
  useEffect(() => {
    if (!charger) {
      console.warn("No active session found in State or Storage. Redirecting.");
      setShowFeedback(true);
    }
  }, []);

  // stop handler
  const handleStopCharging = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsStopping(true);

    try {
      const stopTime = new Date();
      const timestamp = formatToPythonString(stopTime);

      const payload = {
        timestamp: timestamp,
        // session_id: sessionData?.session_id, // recommended: send id if available
        ev_name: localStorage.getItem("EVModel") || "Unknown EV",
      };

      console.log("Stopping session...", payload);

      /////////////////////////////////////////////////////////////////

      const response = await fetch(`${API_URL}/insert-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      /////////////////////////////////////////////////////////////////

      const data = await response.json();

      if (response.ok) {
        console.log("Session stopped successfully:", data);

        // clear active session flags

        setShowFeedback(true);
      } else {
        console.error("Backend failed to stop:", data.error);
        alert(`Error stopping session: ${data.error}`);
        // do not clear local storage here, let them try again.
      }
    } catch (err) {
      console.error("Network Error:", err);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsStopping(false);
    }
  };

  // start charging handler
  const handleChargingDataUpdate = async () => {
    if (!activeChargingSessionData) return;

    try {
      // generate timestamps
      const nowObject = new Date();
      const timestampString = formatToPythonString(nowObject);

      // build payload
      const payload = {
        ev_name: localStorage.getItem("EVModel") || "Unknown EV",
        chosen_charger_type: charger?.type || "Unknown Connector",
        soc_at_charger: charger?.batteryAtChargerNearDestination,
        charging_power: charger?.maxChargeRateKw,
        car_start_charging_timestamp:
          localStorage.getItem("activeSessionStart"),
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
      setActiveSessionData(data);

      localStorage.setItem("activeChargerSession", JSON.stringify(data));

      if (response.ok && !data.error) {
        console.log("received from backend:", data);
        setActiveSessionData(data);
        ///

        if (Number(data.soc) >= 100 && !isStopping) {
          console.log("Battery full! Auto-stopping session...");
          handleStopCharging();
        }
        ///

        //
        //       if (Number(data.soc) >= 100 && !isStopping) {
        // console.log("Battery full! Auto-stopping session...");
        // handleStopCharging();
        // }
      } else {
        console.error("backend error:", data.error);
        alert(`error starting session: ${data.error || "unknown error"}`);
      }
    } catch (err) {
      console.error("network error:", err);
      alert("network error, please check your connection");
    }
  };

  // render loading or error if charger is missing (prevents crash before redirect)
  if (!charger) return <div>Loading Session...</div>;

  // Feedback Popup Component
  const FeedbackPopup = () => {
    if (!showFeedback) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white w-[90%] max-w-lg rounded-lg shadow-lg p-6 relative">
          {/* Close button */}
          <button
            className="absolute top-3 right-3 text-gray-600 hover:text-black"
            onClick={() => setShowFeedback(false)}
          >
            ✕
          </button>

          <h2 className="text-xl font-bold mb-4 text-center">
            How satisfied are you with the overall experience?
          </h2>

          {/* Rating */}
          <div className="flex justify-center gap-4 mb-6 text-4xl cursor-pointer">
            {["😞", "😟", "😐", "😊", "😁"].map((face, index) => (
              <div
                key={index}
                onClick={() => setRating(index + 1)}
                className={`p-2 rounded-full ${
                  rating === index + 1 ? "ring-2 ring-green-500" : ""
                }`}
              >
                {face}
              </div>
            ))}
          </div>

          <label className="font-medium">What could be improved?</label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full border rounded-md p-3 mt-2 h-32"
            placeholder="Type your thoughts here..."
          />

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={async () => {
                await handleStopCharging();
                navigate("/app/planning");
              }} // submit action
            >
              Stop progress and Submit feed
            </Button>
            <Button
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white"
              onClick={() => setShowFeedback(false)} // cancel action
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  };

  function formatTime(timestamp: string) {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const temperature =
    tripPlan?.temperature ?? activeChargingSessionData.temperature;

  const colors = getTemperatureColors(temperature);

  return (
    <div className=" bg-background flex flex-col">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-2 max-w-7xl pb-[200px]">
        <Button
          variant="plain"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Charger Details</span>
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Charging in Progress</h1>
          <p className="text-muted-foreground">
            Your vehicle is currently charging at {charger.address}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 ">
          {/* Left Column - Progress */}
          <div className="lg:col-span-2 space-y-6 ">
            {/* Progress Circle */}
            <Card className="border-0">
              <CardContent className="p-8">
                <div className="flex flex-col items-center mb-8 ">
                  {/* Circular Progress */}
                  <div className="relative w-64 h-64 mb-8">
                    <svg className="transform -rotate-90 w-64 h-64">
                      <circle
                        cx="128"
                        cy="128"
                        r="112"
                        stroke="currentColor"
                        strokeWidth="16"
                        fill="transparent"
                        className="text-muted"
                      />
                      <circle
                        cx="128"
                        cy="128"
                        r="112"
                        stroke="hsl(200, 100%, 60%)"
                        strokeWidth="16"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 112}`}
                        strokeDashoffset={`${
                          2 *
                          Math.PI *
                          112 *
                          (1 - activeChargingSessionData.soc / 100)
                        }`}
                        className="transition-all duration-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-6xl font-bold text-primary">
                        {activeChargingSessionData.soc}%
                      </div>
                      <div className="text-muted-foreground mt-1">Charged</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                    <ChargingInfoCard
                      title="Time Remaining"
                      data={activeChargingSessionData.time_remaining_formatted}
                      type="time"
                    />
                    <ChargingInfoCard
                      title="Current Charge"
                      data={activeChargingSessionData.total_energy}
                      type="charge"
                    />
                    <ChargingInfoCard
                      title="Charging Speed"
                      data={activeChargingSessionData.current_charging_speed}
                      type="speed"
                    />
                  </div>
                </div>

                {/* Time Info */}
                <div className="bg-white shadow-sm rounded-xl p-5 mb-6 flex flex-row justify-between sm:items-center gap-6 border border-gray-100">
                  {/* Left section */}
                  <div className="flex items-center gap-4">
                    {/* Icon container */}
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Estimated Full Charge
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        {formatTime(
                          activeChargingSessionData.charging_finish_timestamp
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right section */}
                  <div className="text-center sm:text-right">
                    <p className="text-sm text-gray-500">Started At</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatTime(
                        currentPayloads?.car_start_charging_timestamp
                      )}
                    </p>
                  </div>
                </div>
                {/* Stop Button */}
                <div className="flex justify-center">
                  <Button
                    color="danger"
                    sx={{ width: "fit-content", height: 60 }}
                    onClick={() => setShowFeedback(true)}
                  >
                    Stop Charging
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right Column - Details */}
          <div className="space-y-6">
            <ChargingDetails
              title="Charger Details"
              Icon={Zap}
              iconColor="text-green-600"
              items={[
                { label: "Station Name", value: charger.displayName.text },
                { label: "Charger Type", value: charger.type },
                {
                  label: "Power Output",
                  value: `${charger.maxChargeRateKw} kW`,
                },
                {
                  label: "Location",
                  value: charger.address,
                },
              ]}
            />

            <ChargingDetails
              title="Battery Status"
              Icon={Battery}
              iconColor="text-blue-600"
              items={[
                {
                  label: "Current Level",
                  value: `${activeChargingSessionData.soc}%`,
                },
                {
                  label: "Starting Level",
                  value: `${charger.batteryAtChargerNearDestination}%`,
                },
                {
                  label: "Energy Added",
                  value: `${activeChargingSessionData.energy_charged} kWh`,
                },
              ]}
            />

            <Card
              className={`border-0 rounded-2xl bg-gradient-to-br ${colors.bg}`}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  {/* Left Section */}
                  <div>
                    <h3 className={`font-bold mb-1 ${colors.text}`}>
                      Current Temperature
                    </h3>

                    <p className={`text-3xl font-bold ${colors.text}`}>
                      {temperature}°C
                    </p>

                    <p className={`text-sm mt-1 ${colors.text}/70`}>
                      Auto-detected
                    </p>
                  </div>

                  {/* Icon */}
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center bg-white`}
                  >
                    <Thermometer className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <FeedbackPopup />
    </div>
  );
};
export default ChargingProgress;
