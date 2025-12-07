import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chip from "@mui/joy/Chip";
import EvSelect from "../components/EvSelect";
import { Typography } from "@mui/joy";

const API_URL = import.meta.env.VITE_API_URL;

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");

  const [selectedCars, setSelectedCars] = useState<string[]>([]);
  const [evList, setEvList] = useState<{ ev_name: string }[]>([]);

  const googleUserId = localStorage.getItem("google_sub");
  const emailAddress = localStorage.getItem("google_email");

  useEffect(() => {
    const fetchEvs = async () => {
      try {
        const response = await fetch(`${API_URL}/get-available-evs`);
        if (response.ok) {
          const data = await response.json();
          setEvList(data);
        } else {
          console.error("Failed to fetch EV list");
        }
      } catch (error) {
        console.error("Error fetching EVs:", error);
      }
    };

    fetchEvs();
  }, []);

  const handleSubmit = async () => {
    if (!fullName || selectedCars.length === 0) {
      alert("Please fill in all fields.");
      return;
    }

    const payload = {
      googleUserId: googleUserId,
      emailAddress: emailAddress,
      fullName: fullName,
      selectedCars: selectedCars,
    };

    try {
      const response = await fetch(`${API_URL}/insert-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("success:", data);

        localStorage.setItem("userData", JSON.stringify(data));
        localStorage.setItem("profileCompleted", "true");

        navigate("/app/planning");
      } else {
        alert("Error saving profile: " + data.error);
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Failed to connect to the server.");
    }
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

        <h1 className="text-3xl font-bold text-center mb-2">
          Complete Your Profile
        </h1>
        <p className="text-gray-500 text-center mb-10">
          Just a few details to get you started on your smart charging journey
        </p>

        {/* FORM FIELDS */}
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              EV Car Models (Select all that apply)
            </label>
            <EvSelect
              evList={evList.map((ev) => ev.ev_name)} // 👈 normalize here
              selectedCars={selectedCars}
              onChange={setSelectedCars}
            />
            {selectedCars.length > 0 && (
              <div className="mt-3">
                <Typography level="body-sm" className="mb-1 text-slate-500">
                  Selected EVs
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {selectedCars.map((car) => (
                    <Chip
                      key={car}
                      variant="soft"
                      color="primary"
                      onClick={() =>
                        setSelectedCars((prev) => prev.filter((c) => c !== car))
                      }
                      endDecorator={<span className="text-xs ml-1">✕</span>}
                    >
                      {car}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="flex items-center justify-between bg-gray-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-400">✉️</span>
                <input
                  type="text"
                  className="bg-transparent outline-none w-full"
                  readOnly
                  value={emailAddress || ""}
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
          className="w-full mt-10 py-4 text-white font-medium rounded-xl bg-linear-to-r from-green-400 to-blue-500 shadow-md hover:opacity-90"
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
