import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

interface PrivateRouteProps {
  children: ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  // TODO: Replace with real authentication check
  // const isAuthenticated = !!localStorage.getItem("accessToken");

  const isAuthenticated = true; // Temporary hardcoded value
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
