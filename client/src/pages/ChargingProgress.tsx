import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { ArrowLeft, Clock, Battery, MapPin, Thermometer } from "lucide-react";
import { Zap } from "lucide-react";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";

import type { Charger } from "../types/charger";

const formatToPythonString = (date: Date) => {
  return date.toLocaleString("sv-SE").replace("T", " ");
};

const ChargingProgress = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isStopping, setIsStopping] = useState(false);

  // initialize sharger state (try location first, then fallback to local storage)
  const [charger, setCharger] = useState(() => {
    if (location.state?.charger) return location.state.charger;
    const saved = localStorage.getItem("active_charger");
    return saved ? JSON.parse(saved) : null;
  });

  const [activeChargingSessionData, setActiveSessionData] = useState<any>(
    location.state?.sessionData || null
  );

  const currentPayloads = location.state?.currentPayload;

  // effect: security check
  useEffect(() => {
    if (!charger) {
      console.warn("No active session found in State or Storage. Redirecting.");
      navigate("/app/planning", { replace: true });
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const savedCharger = localStorage.getItem("activeChargerSession");

      if (savedCharger) {
        console.log("Polling backend for updates...");
        handleChargingDataUpdate();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // stop handler
  const handleStopCharging = async () => {
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

      const response = await fetch("http://localhost:5000/api/insert-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      /////////////////////////////////////////////////////////////////

      const data = await response.json();

      if (response.ok) {
        console.log("Session stopped successfully:", data);

        // clear active session flags
        localStorage.removeItem("active_charger");
        localStorage.removeItem("active_session_start");

        navigate("/app/planning", {
          state: { summary: data },
        });
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
      const response = await fetch(
        "http://localhost:5000/api/charging-details",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      setActiveSessionData(data);

      localStorage.setItem("activeChargerSession", JSON.stringify(data));

      if (response.ok && !data.error) {
        console.log("received from backend:", data);
        setActiveSessionData(data);
        if (Number(data.soc) >= 100) {
          if (!isStopping) {
            console.log("Battery full! Auto-stopping session...");
            handleStopCharging();
          }
        }
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
   

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-7xl pt-[32px] pb-[200px]">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Charger Details</span>
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Charging in Progress</h1>
          <p className="text-muted-foreground">
            Your vehicle is currently charging at {charger.address}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Circle */}
            <Card className="border-0">
              <CardContent className="p-8">
                <div className="flex flex-col items-center mb-8">
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
                    <Card className="bg-secondary/10 border-0">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-secondary mb-1">
                          {activeChargingSessionData.time_remaining_formatted}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Time Remaining
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/10 border-0">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {activeChargingSessionData.total_energy} kWh
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Current Charge
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-accent border-0">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-accent-foreground mb-1">
                          {activeChargingSessionData.current_charging_speed} kW
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Charging Speed
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Time Info */}
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-secondary" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Estimated Full Charge
                      </div>
                      <div className="text-xl font-bold">
                        {activeChargingSessionData.charging_finish_timestamp}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Started At
                    </div>
                    <div className="text-xl font-bold">
                      {currentPayloads.car_start_charging_timestamp}
                    </div>
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Charging Timeline</span>
                    <span className="text-muted-foreground">Target: 100%</span>
                  </div>
                  <div className="relative">
                    <Progress
                      value={activeChargingSessionData.soc}
                      className="h-3"
                    />
                    <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                      <span>0%</span>
                      <span>{activeChargingSessionData.soc}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Stop Button */}
                <Button
                  variant="destructive"
                  className="w-full h-12 text-lg font-semibold"
                  onClick={handleStopCharging}
                >
                  Stop Charging
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Charger Details */}
            <Card className="border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg">Charger Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Station Name</span>
                    <span className="font-semibold">
                      {charger.displayName.text}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Charger Type</span>
                    <span className="font-semibold">{charger.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Power Output</span>
                    <span className="font-semibold">
                      {charger.maxChargeRateKw}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {charger.address}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Battery Status */}
            <Card className="border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Battery className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg">Battery Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Level</span>
                    <span className="font-semibold">
                      {activeChargingSessionData.soc}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Starting Level
                    </span>
                    <span className="font-semibold">
                      {charger.batteryAtChargerNearDestination}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Energy Added</span>
                    <span className="font-semibold">
                      {activeChargingSessionData.energy_charged} kWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Estimated Range
                    </span>
                    <span className="font-semibold">
                      {activeChargingSessionData.estimatedRange} miles
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Temperature Warning */}
            <Card className="bg-warning/10 border-0">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-warning/20 p-2 rounded-lg">
                    <Thermometer className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Current Temperature</h3>
                    <p className="text-3xl font-bold text-warning mb-1">
                      {activeChargingSessionData.temperature}°C
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Auto-detected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
    </div>
  );
};
export default ChargingProgress;
