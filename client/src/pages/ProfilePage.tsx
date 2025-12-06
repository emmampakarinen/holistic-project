import { useEffect, useState } from "react";
import {
  Button,
  Card,
  FormControl,
  FormLabel,
  Typography,
  Select,
  Option,
} from "@mui/joy";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Car } from "lucide-react";
import type { StoredUserData } from "../types/userdata";
const API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [evList, setEvList] = useState<string[]>([]);
  const [userData, setUserData] = useState<StoredUserData | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    selectedCars: [] as string[],
  });

  useEffect(() => {
    const raw = localStorage.getItem("userData");

    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);

      setUserData(parsed);

      // Map frontend-stored structure → formData
      setFormData({
        fullName: parsed.fullName ?? "",
        mobileNumber: parsed.mobile ?? "",
        email: parsed.emailAddress ?? "",
        selectedCars: parsed.selectedCars ?? [],
      });
    } catch (e) {
      console.error("Failed to parse localStorage userData", e);
    }

    const fetchData = async () => {
      try {
        // Fetch EV list
        const evRes = await fetch(`${API_URL}/get-available-evs`);
        const evData = await evRes.json();
        const cleanEvs = evData.map((row: any) => row.ev_name);

        setEvList(cleanEvs);
      } catch (error) {
        console.error("Error fetching EV list", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
}, []);


  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

 const handleUpdateData = async () => {
  if (!userData?.googleUserId) return;

  const payload = {
    googleUserId: userData.googleUserId,
    fullName: formData.fullName,
    emailAddress: formData.email,
    selectedCars: formData.selectedCars,
  };

  try {
    const res = await fetch(`${API_URL}/update-user`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("Updated:", data);
    if (res.ok) {
      const updatedUser = {
        ...userData,
        name: formData.fullName,
        email: formData.email,
        ev_cars: formData.selectedCars.map((ev) => ({ ev_name: ev })),
      };
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      alert("Profile updated!");
    } else {
      alert(data.error || "Failed to update user");
    }
  } catch (e) {
    console.error("Failed updating user", e);
    alert("Failed to update user");
  }
};

  const handleDeleteAccount = () => {
    alert("Delete account logic here");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Typography level="title-lg">Loading profile...</Typography>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 flex items-center justify-center px-4 py-2 min-h-screen">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-4">
          <Typography level="h2" className="font-bold">
            My Profile
          </Typography>
          <Typography level="body-sm" className="text-slate-500 mt-1">
            Manage your account settings and EV information
          </Typography>
        </div>

        <Card
          variant="outlined"
          sx={{
            borderRadius: 24,
            boxShadow: "lg",
            px: { xs: 2, md: 4 },
            py: { xs: 3, md: 4 },
          }}
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <section>
              <Typography level="title-lg" className="mb-4">
                Basic Information
              </Typography>

              <div className="grid md:grid-cols-2 gap-4">
                <FormControl>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Mobile Number</FormLabel>
                  <Input
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      handleInputChange("mobileNumber", e.target.value)
                    }
                  />
                </FormControl>
              </div>

              <FormControl className="mt-4">
                <FormLabel>Email Address</FormLabel>
                <div className="flex gap-2 items-center">
                  <Input value={formData.email} disabled className="flex-1" />
                  <Badge variant="outline">Google Account</Badge>
                </div>
              </FormControl>
            </section>

            {/* EV INFORMATION */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Car className="w-5 h-5 text-emerald-500" />
                <Typography level="title-lg">EV Information</Typography>
              </div>

              <FormControl>
                <FormLabel>Select Your EV(s)</FormLabel>
                <Select
                  multiple
                  placeholder="Select your EV models"
                  value={formData.selectedCars}
                  onChange={(_, newValues) =>
                    handleInputChange("selectedCars", newValues)
                  }
                >
                  {evList.map((car) => (
                    <Option key={car} value={car}>
                      {car}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </section>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                variant="solid"
                color="danger"
                onClick={handleDeleteAccount}
                sx={{ borderRadius: "xl" }}
              >
                Delete Account
              </Button>

              <Button
                variant="solid"
                color="primary"
                onClick={handleUpdateData}
                sx={{ borderRadius: "xl" }}
              >
                Update Data
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
