import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
//import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.tsx";
<<<<<<< HEAD
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
=======
import "./styles/global.css"
>>>>>>> main

createRoot(document.getElementById("root")!).render(
   <GoogleOAuthProvider clientId={clientId}>
    <RouterProvider router={router} />
 </GoogleOAuthProvider>
);
