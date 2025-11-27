import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./styles/global.css"
//import "./index.css";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")!).render(
<GoogleOAuthProvider clientId={clientId}>

    <RouterProvider router={router} />
</GoogleOAuthProvider>

=======


>>>>>>> main

createRoot(document.getElementById("root")!).render(
   <GoogleOAuthProvider clientId={clientId}>
    <RouterProvider router={router} />
 </GoogleOAuthProvider>
>>>>>>> origin/feature-23
);
