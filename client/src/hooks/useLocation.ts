import { useEffect, useState } from "react";

export function useCurrentLocation() {
  const [city, setCity] = useState<string>("Loading...");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLatitude(latitude);
        setLongitude(longitude);

        // Reverse geocode
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await response.json();

        const detectedCity =
          data?.address?.city ||
          data?.address?.town ||
          data?.address?.village ||
          data?.address?.municipality;

        setCity(detectedCity || "Unknown");
      },

      // If permission denied --> use Lahti fallback
      async () => {
        const lahtiLat = 60.9827;
        const lahtiLon = 25.6615;
        setLatitude(lahtiLat);
        setLongitude(lahtiLon);

        // Reverse geocode Lahti from OSM
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lahtiLat}&lon=${lahtiLon}&format=json`
        );
        const data = await response.json();

        const fallbackCity =
          data?.address?.city ||
          data?.address?.town ||
          data?.address?.village ||
          "Lahti";

        setCity(fallbackCity);
      }
    );
  }, []);

  return { city, latitude, longitude };
}
