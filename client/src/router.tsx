import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AppLayout from "./layouts/AppLayout";
import PromptPage from "./pages/PromptPage";
import RoutePlannerPage from "./pages/ChargePlannerPage";
import JourneyPage from "./pages/ChargeJourneyPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import { PrivateRoute } from "./shared/PrivateRoute";

export const router = createBrowserRouter([
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
  {
    path: "/app",
    element: (
      <PrivateRoute>
        <AppLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="prompt" replace />,
      },
      {
        path: "prompt",
        element: <PromptPage />,
      },
      {
        path: "plan",
        element: <RoutePlannerPage />,
      },
      {
        path: "journey",
        element: <JourneyPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
