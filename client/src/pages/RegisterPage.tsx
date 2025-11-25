import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [carName, setCarName] = useState("");
  const [mobile, setMobile] = useState("");

  const email = localStorage.getItem("google_email");

  const handleSubmit = () => {
    if (!fullName || !carName || !mobile) {
      alert("Please fill in all fields.");
      return;
    }

    // Save profile data to localStorage (or send to backend)
    localStorage.setItem("profile_completed", "true");

    // Go to PromptPage
    navigate("/prompt");
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">

      <div className="bg-white shadow-lg rounded-3xl px-10 py-12 max-w-xl w-full">

        {/* Top Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-blue-100 flex items-center justify-center rounded-full">
            <span className="text-blue-600 text-3xl">👤</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">Complete Your Profile</h1>
        <p className="text-gray-500 text-center mb-10">
          Just a few details to get you started on your smart charging journey
        </p>

        {/* FORM FIELDS */}
        <div className="space-y-6">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
              <span className="text-gray-400">👤</span>
              <input
                type="text"
                placeholder="Enter your full name"
                className="bg-transparent outline-none w-full"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          {/* EV Car Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">EV Car Name</label>
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
              <span className="text-gray-400">🚗</span>
              <input
                type="text"
                placeholder="e.g., Tesla Model 3, Nissan Leaf"
                className="bg-transparent outline-none w-full"
                value={carName}
                onChange={(e) => setCarName(e.target.value)}
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
              <span className="text-gray-400">📞</span>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                className="bg-transparent outline-none w-full"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="flex items-center justify-between bg-gray-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-400">✉️</span>
                <input
                  type="text"
                  className="bg-transparent outline-none w-full"
                  readOnly
                  value={email || ""}
                />
              </div>
              <span className="text-green-600 text-xs font-semibold bg-green-100 px-2 py-1 rounded-full">
                ✔ Verified
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              This email is auto-filled from your Google account
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full mt-10 py-4 text-white font-medium rounded-xl 
                     bg-gradient-to-r from-green-400 to-blue-500 shadow-md hover:opacity-90"
        >
          Save & Continue →
        </button>

        {/* Security Notice */}
        <div className="flex items-center justify-center mt-6 text-gray-400 text-xs gap-2">
          <span className="text-blue-600">🔒</span>
          <span>Your information is secure and will never be shared</span>
        </div>

      </div>
    </div>
  );
}
