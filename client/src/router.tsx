import { createBrowserRouter, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import PlanningPage from "./pages/PlanningPage";
import ChargerSuggestionsPage from "./pages/ChargerSuggestionsPage";
import ChargerDetails from "./pages/ChargerDetails";
import ChargingProgress from "./pages/ChargingProgress";

import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

import AppLayout from "./layouts/AppLayout";

export const router = createBrowserRouter([
  // ---------- PUBLIC ROUTES (no header) ----------
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  // ---------- MAIN APP LAYOUT  ----------
  {
    path: "/app",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="planning" replace /> },

      { path: "planning", element: <PlanningPage /> },
      { path: "suggestions", element: <ChargerSuggestionsPage /> },
      { path: "charger/:id", element: <ChargerDetails /> },
      { path: "charging/:id", element: <ChargingProgress /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },

  // ---------- 404 ----------
  {
    path: "*",
    element: <NotFound />,
  },
]);
