import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Map,
  Navigation,
  Calendar,
  Star,
  Info,
} from "lucide-react";
import { Zap } from "lucide-react";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";
import type { Charger } from "../types/charger";
//import { time } from "console";

// formats date as "yyyy-mm-dd hh:mm:ss"
const formatToPythonString = (date: Date) => {
  return date.toLocaleString("sv-SE").replace("T", " ");
};

const ChargerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // get charger data
  const charger = location.state?.charger;

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
          onClick={() => navigate("/app/planning")}

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

      const response_history = await fetch(
        "http://localhost:5000/api/save-history",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trip_history_payload),
        }
      );

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
        expected_charging_time: charger?.total_time_to_charge_seconds || 0,
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      

      {/* Main Content */}
      <main className="container mx-auto px-4 max-w-7xl py-[32px] pb-[200px]">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Results</span>
        </button>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Station Header */}
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {charger?.displayName?.text}
              </h1>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                <span className="text-lg">{charger?.address}</span>
              </div>
            </div>

            {/* Map Placeholder */}
            <Card className="border-0>
              <CardContent className="p-0">
                <div className="relative h-80 bg-muted rounded-lg flex items-center justify-center">
                  <div className="absolute top-4 right-4 bg-card px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 text-sm">
                    <Navigation className="h-4 w-4 text-secondary" />
                    <span className="font-medium">
                      {charger?.distanceMetersWalkingToDestination} meters from
                      destination
                    </span>
                  </div>
                  <div className="text-center">
                    <Map className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
                    <p className="text-lg font-medium text-muted-foreground">
                      Interactive Map View
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charger Specifications */}
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Charger Specifications
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="bg-accent/50 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-accent/30 p-2 rounded-lg">
                        <Zap className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Charger Type
                        </p>
                        <p className="font-bold text-lg">{charger.type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/10 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-secondary/20 p-2 rounded-lg">
                        <Zap className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Power Output
                        </p>
                        <p className="font-bold text-lg">
                          {charger.maxChargeRateKw} kW
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-background p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Est. Charge Time
                        </p>
                        <p className="font-bold text-lg">
                          {charger.totalTimeToChargeFormattedTime}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Perfect Match Info */}
            <Card className="bg-secondary/5 border-0">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <div className="bg-secondary/20 p-2 rounded-full h-fit">
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

          {/* Right Column - Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 h-12"
                    onClick={handleStartCharging}
                  >
                    Start Charging
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12 border-secondary text-secondary hover:bg-secondary/10"
                  >
                    <Navigation className="mr-2 h-5 w-5" />
                    <a
                      href={charger.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Navigate to Charger
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full h-12" asChild>
                    {/* Use a standard anchor tag for external sites */}
                    <a
                      href={charger.websiteUri}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Book Charger
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Station Rating */}
            <Card className="border-0">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Station Rating</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.floor(charger.rating)
                            ? "fill-warning text-warning"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold">{charger.rating}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {charger.reviews} reviews
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default ChargerDetails;
