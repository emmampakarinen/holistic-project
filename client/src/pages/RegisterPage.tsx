import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Chip from "@mui/joy/Chip";
import Box from "@mui/joy/Box";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");

  const [selectedCars, setSelectedCars] = useState<string[]>([]);
  const [evList, setEvList] = useState<{ ev_name: string }[]>([]);

  const googleUserId = localStorage.getItem("google_sub");
  const emailAddress = localStorage.getItem("google_email");

  useEffect(() => {
    const fetchEvs = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/get-available-evs"
        );
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
    if (!fullName || !evList || !mobile) {
      alert("Please fill in all fields.");
      return;
    }

    const payload = {
      googleUserId: googleUserId,
      emailAddress: emailAddress,
      fullName: fullName,
      evList: evList,
    };

    try {
      const response = await fetch("http://localhost:5000/api/insert-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("success:", data);

        localStorage.setItem("userData", JSON.stringify(payload));
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
            <Select
              multiple // <--- ENABLE MULTI SELECT
              placeholder="Select your EV model(s)"
              startDecorator={<span className="text-xl">🚗</span>}
              value={selectedCars}
              onChange={(e, newValues) => setSelectedCars(newValues)}
              // This prop controls how the selected values look inside the box
              renderValue={(selected) => (
                <Box sx={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                  {selected.map((selectedOption) => (
                    <Chip
                      key={selectedOption.value}
                      variant="soft"
                      color="primary"
                      size="sm"
                    >
                      {selectedOption.label}
                    </Chip>
                  ))}
                </Box>
              )}
              variant="soft"
              color="neutral"
              sx={{
                borderRadius: "12px",
                paddingBlock: "12px",
                backgroundColor: "#f3f4f6",
                "&:hover": { backgroundColor: "#e5e7eb" },
                "--Select-decoratorChildHeight": "30px",
                minHeight: "52px", // Ensure height allows for chips
              }}
              slotProps={{
                listbox: {
                  sx: {
                    maxHeight: "200px", // Limit dropdown height
                    overflow: "auto", // Scroll if too many cars
                  },
                },
              }}
            >
              {evList.length === 0 && (
                <Option value={null} disabled>
                  Loading cars...
                </Option>
              )}

              {evList.map((ev, index) => (
                <Option key={index} value={ev.ev_name}>
                  {ev.ev_name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
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
