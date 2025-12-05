import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { ArrowLeft, Clock, Battery, MapPin, Thermometer } from "lucide-react";
import { Zap } from "lucide-react";

// ADDED  — import API helper
import { getPlacesNearCharger } from "../api/places";

const API_URL = import.meta.env.VITE_API_URL;

const formatToPythonString = (date: Date) => {
  return date.toLocaleString("sv-SE").replace("T", " ");
};

const ChargingProgress = () => {
  const location = useLocation();
  const navigate = useNavigate();

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


  // initialize charger state
  const [charger, _ ] = useState(() => {
    if (location.state?.charger) return location.state.charger;
    const saved = localStorage.getItem("active_charger");
    return saved ? JSON.parse(saved) : null;
  });

  const [activeChargingSessionData, setActiveSessionData] = useState<any>(
    location.state?.sessionData || null
  );

  const currentPayloads = location.state?.currentPayload;

  // ADDED — state for storing places
  const [nearbyPlaces, setNearbyPlaces] = useState<any>(null);

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

  // ADDED Heree — fetch nearby places when screen loads
  useEffect(() => {
    async function loadPlaces() {
      if (!charger) return;

      const lat = charger.location?.latitude || charger.location?.lat;
      const lng = charger.location?.longitude || charger.location?.lng;

      try {
        const result = await getPlacesNearCharger(lat, lng);
        console.log("Nearby places:", result);
        setNearbyPlaces(result.places_nearby);
      } catch (err) {
        console.error("Failed to fetch nearby places", err);
      }
    }

    loadPlaces();
  }, [charger]);


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
        ev_name: localStorage.getItem("EVModel") || "Unknown EV",
      };

      const response = await fetch(`${API_URL}/insert-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setShowFeedback(true);
      } else {
        alert(`Error stopping session: ${data.error}`);
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setIsStopping(false);
    }
  };

  // start charging handler
  const handleChargingDataUpdate = async () => {
    if (!activeChargingSessionData) return;
    
    try {
      const nowObject = new Date();
      const timestampString = formatToPythonString(nowObject);

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

      const response = await fetch(
        `${API_URL}/charging-details`,
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
        
        if (Number(data.soc) >= 100 && !isStopping) {
          handleStopCharging();
        }

      } else {
        alert(`error starting session: ${data.error || "unknown error"}`);
      }
    } catch (err) {
      alert("network error");
    }
  };

  if (!charger) return <div>Loading Session...</div>;


  // Feedback Popup Component
  const FeedbackPopup = () => {
    if (!showFeedback) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        {/* ... unchanged ... */}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-7xl pt-[32px] pb-[200px]">
        
        {/* ... ALL YOUR EXISTING LEFT + MIDDLE UI ... */}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* LEFT COLUMN CONTENT — unchanged */}

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            {/* EXISTING CARDS: Charger Details, Battery Status, Temperature Warning */}
            {/* ... unchanged ... */}

            {/* ADDED — Nearby Places & Best Suggestions */}
            <Card className="border-0">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Best Suggestions Within 1 KM</h3>

                {!nearbyPlaces && (
                  <p className="text-muted-foreground">Loading nearby places...</p>
                )}

                {nearbyPlaces && (
                  <div className="space-y-6">
                    {Object.entries(nearbyPlaces).map(([category, places]) => (
                      <div key={category}>
                        <h4 className="font-semibold capitalize mb-2">{category}</h4>
                        
                        {Array.isArray(places) && places.length > 0 ? (
                          places.map((place: any) => (
                            <div
                              key={place.placeId}
                              className="p-3 border rounded-md mb-2 bg-gray-50 shadow-sm"
                            >
                              <strong>{place.name}</strong>
                              <p className="text-sm text-muted-foreground">{place.address}</p>
                              <p className="text-sm font-medium">⭐ {place.rating}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">No suggestions found.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
