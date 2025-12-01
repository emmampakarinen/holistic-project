import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: any) => {
    console.log("Google Login Success:", credentialResponse);

    const token = credentialResponse.credential;

    const payload = JSON.parse(atob(token.split(".")[1]));
    const email = payload.email;
    const google_user_id = payload.sub;

    localStorage.setItem("google_token", token);
    localStorage.setItem("google_email", email);
    localStorage.setItem("google_sub", google_user_id);

    try {
      const response = await fetch("http://localhost:5000/api/get-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(google_user_id),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("userData", JSON.stringify(data));
        localStorage.setItem("profileCompleted", "true");

        navigate("/app/planning");
      } else {
        console.log("user not found, redirecting to register");
        localStorage.removeItem("profile_completed");
        navigate("/register");
      }
    } catch (error) {
      console.error("Network error fetching user:", error);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 px-5">
      {/* CARD */}
      <div className="bg-white shadow-lg rounded-3xl px-10 py-12 max-w-md w-full text-center">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/images/logo.png"
            alt="Ev-Logo"
            className="icon-lg mx-auto mb-2"
          />
          <h1 className="text-4xl font-bold">EV TimeCharge</h1>
        </div>

        <h2 className="text-xl font-semibold mb-2">Welcome</h2>
        <p className="text-gray-500 text-sm mb-6">
          Sign in to continue your journey
        </p>

        {/* GOOGLE LOGIN */}
        <div className="flex justify-center w-full mb-5">
          <div
            className="flex justify-center items-center"
            style={{ minWidth: "280px" }}
          >
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.log("Login Failed")}
            />
          </div>
        </div>

        <p className="text-gray-400 text-xs mb-6">
          First-time Google users will be directed to Register.
        </p>

        {/* Second-time DIVIDER */}
        <div className="flex items-center gap-4 justify-center mb-6">
          <span className="w-16 h-px bg-gray-300"></span>
          <span className="text-gray-400 text-xs">Second Time</span>
          <span className="w-16 h-px bg-gray-300"></span>
        </div>

        {/* FEATURES */}
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-300 rounded-full"></div>
            <div>
              <p className="font-medium">Time Charging Plans</p>
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
    </div>
  );
}

export default LoginPage;
