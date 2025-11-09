import { useEffect, useState } from "react";

export default function App() {
  const [api, setApi] = useState<{ ok: boolean; db?: string } | null>(null);

  useEffect(() => {
    const url =
      import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/health";
    fetch(url)
      .then((r) => r.json())
      .then(setApi)
      .catch(() => setApi({ ok: false }));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>CargeMate</h1>
      <p>Backend says: {api ? JSON.stringify(api) : "…loading"}</p>
    </main>
  );
}
