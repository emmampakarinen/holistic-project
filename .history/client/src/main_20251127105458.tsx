import { createRoot } from "react-dom/client";

//import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.tsx";
import "./styles/global.css"

import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./styles/global.css";
//import "./index.css";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={clientId}>
    <RouterProvider router={router} />
  </GoogleOAuthProvider>
);
