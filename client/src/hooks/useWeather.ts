import { useEffect, useState } from "react";

// Hook to get current temperature based on user's location using Open-Meteo API
export function useCurrentTemperature() {
  const [temp, setTemp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Get user's geolocation and fetch temperature
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        const data = await res.json();

        // Set temperature from API response
        setTemp(data.current_weather.temperature);
        setLoading(false);
      },
      async () => {
        // fallback: Lahti
        const lat = 60.9827;
        const lon = 25.6615;

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const data = await res.json();
        setTemp(data.current_weather.temperature);
        setLoading(false);
      }
    );
  }, []);

  return { temp, loading };
}
