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
  ///////
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
  const [charger, setCharger] = useState(() => {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">

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
                    <Card className="bg-secondary/10 border-0">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-secondary mb-1">
                          {activeChargingSessionData.time_remaining_formatted}
                        </div>
                        <div className="text-sm text-blue-800/70">
                          Time Remaining
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/10 border-0">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {activeChargingSessionData.total_energy} kWh
                        </div>
                        <div className="text-sm text-green-800/70">
                          Current Charge
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-accent border-0">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-accent-foreground mb-1">
                          {activeChargingSessionData.current_charging_speed} kW
                        </div>
                        <div className="text-sm text-purple-800/70">
                          Charging Speed
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Time Info */}
                <div className="bg-gray-100 rounded-lg p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* Left section */}
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
                  {/* Right section */}
                  <div className="text-left sm:text-right">
                    <div className="text-sm text-muted-foreground">
                      Started At
                    </div>
                    <div className="text-xl font-bold">
                      {currentPayloads?.car_start_charging_timestamp}
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
                      className="h-3 rounded-full overflow-hidden"
                    />
                    {/* Gradient bar */}
                    <div
                      className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-red-500 via-blue-500 to-green-500"
                      style={{ width: `${activeChargingSessionData.soc}%` }}
                    />

                    <div className="flex justify-center mt-1 text-xs font-bold text-gray-700">
                      {activeChargingSessionData.soc}%
                    </div>
                  </div>
                </div>

                {/* Stop Button */}
                <Button
                  variant="destructive"
                  className="w-full h-12 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => setShowFeedback(true)}
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
                <div className="flex items-center gap-2 mb-4 ">
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
      <Footer />
      <FeedbackPopup />
    </div>
  );
};
export default ChargingProgress;
