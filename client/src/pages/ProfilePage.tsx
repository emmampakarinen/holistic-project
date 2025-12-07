import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  FormControl,
  FormLabel,
  Typography,
  Input,
} from "@mui/joy";
import type { StoredUserData } from "../types/userdata";
import { EvSection } from "../components/EvSection";
import type { ProfileFormData } from "../types/profileform";
const API_URL = import.meta.env.VITE_API_URL;

type EvRow = { ev_name: string };

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [evList, setEvList] = useState<string[]>([]);

  const [initialCars, setInitialCars] = useState<string[]>([]);
  const [userData, setUserData] = useState<StoredUserData | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    emailAddress: "",
    selectedCars: [],
  });

  useEffect(() => {
    const raw = localStorage.getItem("userData");
    if (!raw) {
      setLoading(false);
      return;
    }
    console.log(raw);
    try {
      const parsed = JSON.parse(raw);

      const normalizedCars = Array.isArray(parsed?.ev_cars)
        ? parsed.ev_cars.map((c: { ev_name: string }) =>
            typeof c === "string" ? c : c.ev_name
          )
        : [];

      setUserData(parsed);

      setFormData({
        name: parsed?.name ?? "",
        emailAddress: parsed?.email ?? "",
        selectedCars: normalizedCars,
      });
      setInitialCars(normalizedCars);
    } catch (e) {
      console.error("Failed to parse localStorage userData", e);
    }

    const fetchData = async () => {
      try {
        // Fetch EV list
        const evRes = await fetch(`${API_URL}/get-available-evs`);
        const evData: EvRow[] = await evRes.json();
        const cleanEvs = evData.map((row) => row.ev_name);

        setEvList(cleanEvs);
      } catch (error) {
        console.error("Error fetching EV list", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const removeCar = (car: string) => {
    console.log("deleted", car);
    handleInputChange(
      "selectedCars",
      formData.selectedCars.filter((c) => c !== car)
    );
  };

  const handleInputChange = <K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // update user data
  const handleUpdateData = async () => {
    if (!userData?.user_id) {
      alert("Missing googleUserId in local storage");
      return;
    }

    const payload = {
      googleUserId: userData.user_id,
      fullName: formData.name,
      emailAddress: formData.emailAddress,
      selectedCars: formData.selectedCars,
    };

    try {
      const res = await fetch(`${API_URL}/update-user`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log(formData.name);
      const data = await res.json();
      console.log("Updated:", data);

      if (res.ok) {
        const updatedUser = {
          ...userData,
          name: formData.name,
          ev_cars: formData.selectedCars.map((ev) => ({ ev_name: ev })),
        };

        localStorage.setItem("userData", JSON.stringify(updatedUser));
        setUserData(updatedUser);
        setInitialCars(formData.selectedCars);

        alert("Profile updated!");
      } else {
        alert(data.error || "Failed to update user");
      }
    } catch (e) {
      console.error("Failed updating user", e);
      alert("Failed to update user");
    }
  };

  // delete account
  const handleDeleteAccount = async () => {
    if (!userData?.user_id) {
      alert("Missing googleUserId in local storage");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/delete-user`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleUserId: userData.user_id,
        }),
      });

      const data = await res.json();
      console.log("Delete response:", data);

      if (res.ok) {
        localStorage.clear();

        setUserData(null);
        setFormData({
          name: "",
          emailAddress: "",
          selectedCars: [],
        });
        setInitialCars([]);

        alert("Your account has been deleted.");
        navigate("/");
      } else {
        alert(data.error || "Failed to delete account");
      }
    } catch (e) {
      console.error("Failed deleting user", e);
      alert("Failed to delete account. Please try again.");
    }
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

              <div className=" gap-4">
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </FormControl>
              </div>

              <FormControl className="mt-4">
                <FormLabel>Email Address (Google account)</FormLabel>
                <div className="flex gap-2 items-center">
                  <Input
                    value={formData.emailAddress}
                    disabled
                    className="flex-1"
                  />
                </div>
              </FormControl>
            </section>

            {/* EV INFORMATION */}
            <section>
              <EvSection
                evList={evList}
                selectedCars={formData.selectedCars}
                initialCars={initialCars}
                removeCar={removeCar}
                handleInputChange={handleInputChange}
              />
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
