import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { APIProvider } from "@vis.gl/react-google-maps";
import "/src/styles/global.css";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={clientId}>
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_API_KEY}>
      <RouterProvider router={router} />
    </APIProvider>
  </GoogleOAuthProvider>
);
