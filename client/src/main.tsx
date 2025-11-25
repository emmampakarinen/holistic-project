import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
<<<<<<< HEAD
//import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.tsx";
import "./styles/global.css"
=======
import { RouterProvider } from "react-router-dom";
import { router } from "./router.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";


const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
>>>>>>> feature-24-clean

createRoot(document.getElementById("root")!).render(
<GoogleOAuthProvider clientId={clientId}>

    <RouterProvider router={router} />
</GoogleOAuthProvider>
);
