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

    // Go to LandingPage
    navigate("/register");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>EV SmartCharge</h1>
      <h5>Your intelligent companion for seamless EV charging journeys</h5>

      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Login Failed")}
      />
    </div>
  );
}

export default LoginPage;

