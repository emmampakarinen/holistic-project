// client/src/api/places.ts

/**
 * Fetches nearby places & activities around a charger.
 * Calls backend endpoint: POST /api/places-near-charger
 */

export async function getPlacesNearCharger(latitude: number, longitude: number) {
  const apiUrl = import.meta.env.VITE_API_URL;

  const response = await fetch(`${apiUrl}/places-near-charger`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      latitude: latitude,
      longitude: longitude,
      radius_meters: 1000   // 1 km radius — matches backend default
    }),
  });

  if (!response.ok) {
    console.error("Failed to fetch places:", response.statusText);
    throw new Error("Failed to load nearby places");
  }

  return response.json();
}
