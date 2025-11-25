import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse: any) => {
    console.log("Google Login Success:", credentialResponse);

    // get token
    const token = credentialResponse.credential;

    // decode Google email
    const payload = JSON.parse(atob(token.split(".")[1]));
    const email = payload.email;

    // Save user info
    localStorage.setItem("google_token", token);
    localStorage.setItem("google_email", email);

     const previouslyRegistered = localStorage.getItem("profile_completed");

    if (previouslyRegistered === "true") {
      navigate("/prompt");
    } else {
      navigate("/register");
    }
  };

  return (
   <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 px-10">

      {/* CARD */}
      <div className="bg-white shadow-lg rounded-3xl px-10 py-12 max-w-md w-full text-center">

        <h1 className="text-2xl font-bold mb-2">EV SmartCharge</h1>
        <p className="text-gray-500 text-sm mb-6">
          Plan smarter EV charging sessions
        </p>

        <h2 className="text-xl font-semibold mb-2">Welcome</h2>
        <p className="text-gray-500 text-sm mb-6">
          Sign in to continue your journey
        </p>

        {/* GOOGLE LOGIN */}
        <div className="mb-4 flex justify-center">
          <GoogleLogin 
            onSuccess={handleSuccess} 
            onError={() => console.log("Login Failed")} 
          />
        </div>

        <p className="text-gray-400 text-xs mb-6">
          First-time Google users will be directed to Register.
        </p>

        {/* Second-time DIVIDER */}
        <div className="flex items-center gap-4 justify-center mb-6">
          <span className="w-16 h-px bg-gray-300"></span>
          <span className="text-gray-400 text-xs">Second-time</span>
          <span className="w-16 h-px bg-gray-300"></span>
        </div>

        {/* FEATURES */}
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-300 rounded-full"></div>
            <div>
              <p className="font-medium">Smart Charging Plans</p>
              <p className="text-gray-500 text-sm">
                Find optimal chargers for your journey
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-300 rounded-full"></div>
            <div>
              <p className="font-medium">Location-Based Recommendations</p>
              <p className="text-gray-500 text-sm">
                Chargers near your destination
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-purple-300 rounded-full"></div>
            <div>
              <p className="font-medium">Real-Time Tracking</p>
              <p className="text-gray-500 text-sm">
                Monitor your charging progress
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="mt-6 text-gray-400 text-sm flex gap-4">
        <a href="#">About</a> · <a href="#">Help</a> · <a href="#">Contact</a>
      </footer>

      <p className="text-xs text-gray-300 mt-2">
        Secure authentication powered by Google
      </p>

    </div>
  );
}

export default LoginPage;

