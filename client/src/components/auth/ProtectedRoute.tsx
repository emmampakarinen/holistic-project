import { Navigate } from "react-router-dom";

// A higher-order component that wraps protected routes
// It checks if the user is authenticated (i.e., has a valid token in localStorage)
// If not authenticated, it redirects to the landing page
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = Boolean(localStorage.getItem("google_sub"));
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
