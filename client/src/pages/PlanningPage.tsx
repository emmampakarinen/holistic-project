import { useEffect, useState } from "react";
import {
  Button,
  Card,
  FormControl,
  FormLabel,
  Input,
  Sheet,
  Slider,
  Typography,
  Alert,
  Select,
  Option,
} from "@mui/joy";
import { useCurrentTemperature } from "../hooks/useWeather";
import { useCurrentLocation } from "../hooks/useLocation";
import { useNavigate } from "react-router-dom";
import type { TripPlan } from "../types/trip";

interface PlanningFormData {
  location: string;
  destination: string;
  hours: string;
  minutes: string;
  battery: number;
  EVModel: string | null;
}

interface TripHistoryItem {
  starting_points: string;
  ending_points: string;
  car_start_charging_timestamp: string;
  expected_charging_time: number;
}

// the planning page where users input their trip details to find suitable chargers

export default function PlanningPage() {
  // custom hooks to get current temperature and users location

  const navigate = useNavigate();
  const { city, latitude, longitude } = useCurrentLocation();
  const { temp, loading } = useCurrentTemperature();

  // state variables for form inputs

  const [formData, setFormData] = useState<PlanningFormData>(() => ({
    location: localStorage.getItem("location") || "",
    destination: localStorage.getItem("destination") || "",
    hours: localStorage.getItem("hours") || "",
    minutes: localStorage.getItem("minutes") || "",
    battery: Number(localStorage.getItem("battery")) || 65,
    EVModel:
      localStorage.getItem("EVModel") === "null"
        ? null
        : localStorage.getItem("EVModel"),
  }));

  const [evList, setEvList] = useState<{ ev_name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tripHistory, setTripHistory] = useState<TripHistoryItem[]>([]);

  const google_user_id = localStorage.getItem("google_sub");

  // helper to update state fields
  const updateField = (field: keyof PlanningFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const profileCompleted = localStorage.getItem("profileCompleted");

    // Security check: Redirect and STOP execution
    if (!profileCompleted) {
      navigate("/register");
      return;
    }

    const controller = new AbortController();

    const fetchEvs = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/get-user-evs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ google_id: google_user_id }),
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          setEvList(data.ev_cars || []);
        } else {
          console.error("Failed to fetch EV list");
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching EVs:", error);
        }
      }
    };

    const fetchHistory = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/get-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ google_id: google_user_id }),
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setTripHistory(data || []);
        } else {
          console.error("ailed to fetch EV list");
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching EVs:", error);
        }
      }
    };

    fetchEvs();
    fetchHistory();

    return () => controller.abort(); // cleanup on unmount
  }, [navigate, google_user_id]);

  // auto fill location from gps if empty

  useEffect(() => {
    if (city && city !== "Loading..." && !formData.location) {
      updateField("location", city);
    }
  }, [city, formData.location]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Returns format like "30 Nov • 13:47"
    return `${date.getDate()} ${date.toLocaleString("default", {
      month: "short",
    })} • ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0 min";
    const minutes = Math.round(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours} hr ${mins > 0 ? `${mins} min` : ""} charging`;
    }
    return `${minutes} min charging`;
  };

  const cleanAddress = (addr: string) => addr.split(",")[0];

  // handle form submission to find chargers

  const handleFindChargers = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    // save inputs to localStorage
    Object.entries(formData).forEach(([key, value]) => {
      localStorage.setItem(key, String(value));
    });

    // calculate total minutes
    const timeAtDestination =
      (Number(formData.hours) || 0) * 60 + (Number(formData.minutes) || 0);

    // construct payload using the imported TripPlan type
    const payload: TripPlan = {
      latitude: latitude,
      longitude: longitude,
      city: city,
      location: formData.location,
      destination: formData.destination,
      EVModel: formData.EVModel || "",
      minutesAtDestination: timeAtDestination,
      battery: formData.battery,
      temperature: temp,
    };

    // set whole data to localStorage
    const currentTripPlan = payload;
    localStorage.setItem("currentTripPlan", JSON.stringify(currentTripPlan));

    try {
      const response = await fetch("http://localhost:5000/api/find-charger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Can't reach destination chargers");
      }

      navigate("/app/suggestions", {
        state: { trip: payload, chargers: data },
      });
    } catch (err: any) {
      console.error("Failed to fetch trip data", err);
      setErrorMessage(err.message || "Network error, please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className=" bg-slate-50 flex items-center justify-center px-4 py-2">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Typography level="h2" className="font-bold">
            Plan Your Journey
          </Typography>
          <Typography level="body-sm" className="text-slate-500 mt-1">
            Enter your trip details to find the perfect charging solution
          </Typography>
        </div>

        <Card
          variant="outlined"
          sx={{
            borderRadius: 24,
            boxShadow: "lg",
            px: { xs: 2, md: 4 },
            py: { xs: 3, md: 4 },
          }}
        >
          <form onSubmit={handleFindChargers}>
            <div className="space-y-4">
              <FormControl>
                <FormLabel>Current Location</FormLabel>
                <Input
                  value={formData.location}
                  placeholder="Enter your current location"
                  onChange={(e) => updateField("location", e.target.value)}
                  required
                />
              </FormControl>

              <FormControl>
                <FormLabel>Destination</FormLabel>
                <Input
                  placeholder="Where are you going?"
                  value={formData.destination}
                  onChange={(e) => updateField("destination", e.target.value)}
                  required
                />
              </FormControl>

              <div>
                <FormLabel>Time Spent at Destination</FormLabel>

                <div className="flex gap-3 mt-2">
                  <FormControl sx={{ flex: 1 }}>
                    <FormLabel>Hours</FormLabel>
                    <Input
                      type="number"
                      placeholder="0"
                      slotProps={{ input: { min: 0, max: 12 } }}
                      value={formData.hours}
                      onChange={(e) => updateField("hours", e.target.value)}
                      required
                    />
                  </FormControl>
                  <FormControl sx={{ flex: 1 }}>
                    <FormLabel>Minutes</FormLabel>
                    <Input
                      type="number"
                      placeholder="0"
                      slotProps={{ input: { min: 0, max: 59 } }}
                      value={formData.minutes}
                      onChange={(e) => updateField("minutes", e.target.value)}
                      required
                    />
                  </FormControl>
                </div>
              </div>

              <FormControl>
                <FormLabel>Current Battery Level</FormLabel>
                <div className="flex items-center gap-4">
                  <Slider
                    value={formData.battery}
                    // the second argument newValue is the actual number
                    onChange={(_, newValue) => updateField("battery", newValue)}
                    min={0}
                    max={100}
                  />
                  <Typography level="body-lg" fontWeight="lg">
                    {formData.battery}%
                  </Typography>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </FormControl>

              <FormControl>
                <FormLabel>EV Car Model</FormLabel>

                <Select
                  placeholder="Select your EV model"
                  startDecorator={<span className="text-xl">🚗</span>}
                  // connect to your existing state variable
                  value={formData.EVModel}
                  onChange={(_, newValue) => updateField("EVModel", newValue)}
                  required
                  // apply your custom styling
                  variant="soft"
                  color="neutral"
                  sx={{
                    borderRadius: "12px", // matches your other inputs
                    paddingBlock: "12px",
                    backgroundColor: "#f3f4f6", // matches bg-gray-100
                    "&:hover": { backgroundColor: "#e5e7eb" },
                    "--Select-decoratorChildHeight": "30px",
                    width: "100%", // ensure it fills the form control
                  }}
                >
                  {formData.EVModel && (
                    <Option
                      value={formData.EVModel}
                      style={{ display: "none" }}
                    >
                      {formData.EVModel}
                    </Option>
                  )}

                  {evList.length === 0 && (
                    <Option value={null} disabled>
                      Loading cars...
                    </Option>
                  )}

                  {evList.map((ev, index) => (
                    <Option key={index} value={ev.ev_name}>
                      {ev.ev_name}
                    </Option>
                  ))}
                </Select>
              </FormControl>

              <Sheet
                variant="soft"
                sx={{
                  mt: 1,
                  borderRadius: "lg",
                  px: 2,
                  py: 1.5,
                  backgroundColor: "neutral.softBg",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Typography level="body-sm" fontWeight="lg">
                      Current Temperature
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "success.500" }}>
                      Auto-detected from {city}
                    </Typography>
                  </div>

                  <div className="text-right">
                    <Typography level="h4">
                      {loading ? "..." : temp !== null ? `${temp}°C` : "--"}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "success.500" }}>
                      Optimal range
                    </Typography>
                  </div>
                </div>
              </Sheet>

              <Button
                color="success"
                size="lg"
                sx={{ mt: 2, borderRadius: "xl" }}
                className="w-full"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Calculating..." : "Find Chargers"}
              </Button>

              {errorMessage && (
                <Alert
                  variant="soft"
                  color="danger"
                  sx={{ mb: 2, borderRadius: "md" }}
                >
                  <Typography level="body-sm" color="danger">
                    {errorMessage}
                  </Typography>
                </Alert>
              )}
            </div>
          </form>

          <div className="pt-4">
            <Typography level="title-sm" className="mb-2">
              Recent Trips
            </Typography>

            {/* 5. Dynamic Rendering */}
            {tripHistory.length === 0 ? (
              <Typography
                level="body-sm"
                sx={{ color: "neutral.500", fontStyle: "italic" }}
              >
                No recent trips found.
              </Typography>
            ) : (
              tripHistory.map((trip, index) => (
                <Sheet
                  key={index} // Use unique ID if available, otherwise index
                  variant="outlined"
                  sx={{ borderRadius: "lg", mb: 1, px: 2, py: 1.5 }}
                >
                  <Typography level="body-md" fontWeight="md">
                    {/* Dynamic Locations */}
                    {cleanAddress(trip.starting_points)} ➜{" "}
                    {cleanAddress(trip.ending_points)}
                  </Typography>

                  <Typography level="body-xs" sx={{ color: "neutral.500" }}>
                    {/* Dynamic Date & Duration */}
                    {formatDate(trip.car_start_charging_timestamp)} •{" "}
                    {formatDuration(trip.expected_charging_time)}
                  </Typography>
                </Sheet>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
