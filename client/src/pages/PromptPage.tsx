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
} from "@mui/joy";
import { useCurrentTemperature } from "../hooks/useWeather";
import { useCurrentLocation } from "../hooks/useLocation";
import { useNavigate } from "react-router-dom";

export default function PromptPage() {
  // Custom hooks to get current temperature and users location
  const { city, latitude, longitude } = useCurrentLocation();
  const { temp, loading } = useCurrentTemperature();
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [battery, setBattery] = useState(65);
  const [EVModel, setEVModel] = useState("");

  const timeAtDestinationMinutes =
    (Number(hours) || 0) * 60 + (Number(minutes) || 0);

  const handleFindChargers = async () => {
    const minutesAtDestination = timeAtDestinationMinutes;

    // Prepare payload
    const payload = {
      latitude,
      longitude,
      location,
      destination,
      EVModel,
      minutesAtDestination,
      battery,
      temperature: temp,
    };

    try {
      /*await fetch("", {
        // backend endpoint to be added
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });*/
      // handle response
      // Navigate to results page
      navigate("/app/suggestions");
    } catch (err) {
      console.error("Failed to send trip data", err);
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
                <Input
                  placeholder="e.g., Tesla Model 3, Nissan Leaf"
                  onChange={(e) => setEVModel(e.target.value)}
                  required
                />
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
              >
                Find Chargers
              </Button>
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
