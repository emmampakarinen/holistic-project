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

// the planning page where users input their trip details to find suitable chargers

export default function PlanningPage() {

  // custom hooks to get current temperature and users location
  const { city, latitude, longitude } = useCurrentLocation();
  const { temp, loading} = useCurrentTemperature();
  const navigate = useNavigate();

  // state variables for form inputs

  const [location, setLocation] = useState(() => {
    return localStorage.getItem("location") || "";
  });

  const [destination, setDestination] = useState(() => {
    return localStorage.getItem("destination") || "";
  });

  const [hours, setHours] = useState(() => {
    return localStorage.getItem("hours") || "";
  });

  const [minutes, setMinutes] = useState(() => {
    return localStorage.getItem("minutes") || "";
  });

  const [battery, setBattery] = useState(() => {
    const saved = localStorage.getItem("battery");
    return saved !== null ? Number(saved) : 65;
  });

  const [EVModel, setEVModel] = useState(() => {
    const saved = localStorage.getItem("EVModel");
    return (saved === "null" || !saved) ? null : saved;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [evList, setEvList] = useState<{ ev_name: string }[]>([]);

  const timeAtDestinationMinutes =(Number(hours) || 0) * 60 + (Number(minutes) || 0);

  const google_user_id = localStorage.getItem("google_sub");

  useEffect(() => {
    const fetchEvs = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/get-user-evs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(google_user_id),
        });

        if (response.ok) {
          const data = await response.json();
          setEvList(data.ev_cars || []);
        } 
        else {
          console.error("Failed to fetch EV list");
        }
      } 
      catch (error) {
        console.error("Error fetching EVs:", error);
      }
    };

    fetchEvs();
  }, []);

  // handle form submission to find chargers

  const handleFindChargers = async (e: React.FormEvent) => {
    
    e.preventDefault();
    setErrorMessage(null); // Clear previous errors
    setIsSubmitting(true);   // Start loading spinner/disable button

    const payload: TripPlan = {
      latitude,
      longitude,
      location,
      destination,
      EVModel,
      minutesAtDestination: timeAtDestinationMinutes,
      battery,
      temperature: temp,
    };

    localStorage.setItem("location", location);
    localStorage.setItem("destination", destination);
    localStorage.setItem("hours", hours);
    localStorage.setItem("minutes", minutes);
    localStorage.setItem("battery", battery.toString());
    localStorage.setItem("EVModel", EVModel || "");
    
    try {

      const response = await fetch("http://localhost:5000/api/find-charger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setErrorMessage(data.error || "can't reach destinaton chargers");
        return; 
      }

      navigate("/app/suggestions", { 
        state: { 
          trip: payload, 
          chargers: data
        } 
      });

    } 
    catch (err) {
      console.error("failed to fetch trip data", err);
      setErrorMessage("network error, please try again");
    } 
    finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (city && city !== "Loading...") {
      setLocation(city);
    }
  }, [city]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
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
                  value={location}
                  placeholder="Enter your current location"
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </FormControl>

              <FormControl>
                <FormLabel>Destination</FormLabel>
                <Input
                  placeholder="Where are you going?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
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
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      required
                    />
                  </FormControl>

                  <FormControl sx={{ flex: 1 }}>
                    <FormLabel>Minutes</FormLabel>
                    <Input
                      type="number"
                      placeholder="0"
                      slotProps={{ input: { min: 0, max: 59 } }}
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                      required
                    />
                  </FormControl>
                </div>
              </div>

              <FormControl>
                <FormLabel>Current Battery Level</FormLabel>
                <div className="flex items-center gap-4">
                  <Slider
                    value={battery}
                    min={0}
                    max={100}
                    onChange={(_, value) => setBattery(value as number)}
                    sx={{ flex: 1 }}
                  />
                  <Typography level="body-lg" fontWeight="lg">
                    {battery}%
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
                  value={EVModel} 
                  onChange={(e, value) => setEVModel(value)}
                  
                  required
                  
                  // apply your custom styling
                  variant="soft"
                  color="neutral"
                  sx={{
                    borderRadius: "12px",     // matches your other inputs
                    paddingBlock: "12px", 
                    backgroundColor: "#f3f4f6", // matches bg-gray-100
                    "&:hover": { backgroundColor: "#e5e7eb" },
                    "--Select-decoratorChildHeight": "30px",
                    width: "100%" // ensure it fills the form control
                  }}

                >
                  {EVModel && (
                      <Option value={EVModel} style={{ display: 'none' }}>
                        {EVModel}
                      </Option>
                  )}

                  {evList.length === 0 && (
                    <Option value={null} disabled>Loading cars...</Option>
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
                      {loading ? "..." : `${temp}°C`}
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
            <Sheet
              variant="outlined"
              sx={{ borderRadius: "lg", mb: 1, px: 2, py: 1.5 }}
            >
              <Typography level="body-md" fontWeight="md">
                Home ➜ Downtown Mall
              </Typography>
              <Typography level="body-xs" sx={{ color: "neutral.500" }}>
                2 days ago • 45 min charging
              </Typography>
            </Sheet>
            <Sheet
              variant="outlined"
              sx={{ borderRadius: "lg", px: 2, py: 1.5 }}
            >
              <Typography level="body-md" fontWeight="md">
                Office ➜ Airport
              </Typography>
              <Typography level="body-xs" sx={{ color: "neutral.500" }}>
                1 week ago • 1 hr charging
              </Typography>
            </Sheet>
          </div>
        </Card>
      </div>
    </div>
  );
}
