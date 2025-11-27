import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
<<<<<<< HEAD
import { RouterProvider } from "react-router-dom";
import { router } from "./router.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";


const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")!).render(
<GoogleOAuthProvider clientId={clientId}>

    <RouterProvider router={router} />
</GoogleOAuthProvider>
=======
//import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.tsx";
<<<<<<< HEAD
i
c
import "./styles/global.css"
>>>>>>> main

createRoot(document.getElementById("root")!).render(
   <GoogleOAuthProvider clientId={clientId}>
    <RouterProvider router={router} />
 </GoogleOAuthProvider>
>>>>>>> origin/feature-23
);
