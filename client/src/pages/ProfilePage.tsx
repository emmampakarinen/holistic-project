import { useState } from "react";
import {
  Button,
  Card,
  FormControl,
  FormLabel,
  ListItem,
  ListItemContent,
  Typography,
} from "@mui/joy";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Car, List } from "lucide-react";
import type { StoredUserData } from "../types/userdata";

const Profile = () => {
  const [formData, setFormData] = useState(() => {
    const raw = localStorage.getItem("userData");
    let parsed: StoredUserData | null = null;

    if (raw) {
      try {
        parsed = JSON.parse(raw) as StoredUserData;
      } catch (err) {
        console.error("Failed to parse userData from localStorage", err);
      }
    }

    return {
      fullName: parsed?.name ?? "",
      mobileNumber: "",
      email: parsed?.email ?? "",
      evCarName: parsed?.ev_cars?.[0]?.ev_name ?? "",
    };
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteAccount = () => {
    console.log("Permanently deleting account");
  };

  const handleUpdateData = () => {
    console.log("Permanently deleting account");
  };

  const [userData] = useState<StoredUserData | null>(() => {
    const raw = localStorage.getItem("userData");
    if (!raw) return null;

    try {
      return JSON.parse(raw) as StoredUserData;
    } catch (err) {
      console.error("Failed to parse userData from localStorage", err);
      return null;
    }
  });

  return (
    <div className="bg-slate-50 flex items-center justify-center px-4 py-2 min-h-screen">
      <div className="w-full max-w-4xl">
        {/* Title section – same style as PlanningPage */}
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
              <div className="flex items-center gap-2 mb-4">
                <Typography level="title-lg" fontWeight="lg">
                  Basic Information
                </Typography>
              </div>

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

              <div className="mt-4">
                <FormControl>
                  <FormLabel>Email Address</FormLabel>
                  <div className="flex gap-2 items-center">
                    <Input value={formData.email} disabled className="flex-1" />
                    <Badge variant="outline" className="shrink-0">
                      Google Account
                    </Badge>
                  </div>
                </FormControl>
                <Typography
                  level="body-xs"
                  className="mt-1 flex items-center gap-1 text-slate-500"
                >
                  <span>🔒</span>
                  Email cannot be changed as it&apos;s linked to your Google
                  account
                </Typography>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Car className="w-5 h-5 text-emerald-500" />
                <Typography level="title-lg" fontWeight="lg">
                  EV Information
                </Typography>
              </div>

              <FormControl>
                <FormLabel>Default EV Car Name</FormLabel>
                <Input
                  value={formData.evCarName}
                  onChange={(e) =>
                    handleInputChange("evCarName", e.target.value)
                  }
                />
              </FormControl>

              {/* List of all EVs from userData */}
              <div className="mt-4">
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  My EVs
                </Typography>

                {!userData?.ev_cars || userData.ev_cars.length !== 0 ? (
                  <Typography
                    level="body-sm"
                    sx={{ color: "neutral.500", fontStyle: "italic" }}
                  >
                    No EVs saved yet.
                  </Typography>
                ) : (
                  <List
                    // variant="outlined"
                    // sx={{
                    //   borderRadius: "lg",
                    //   borderColor: "neutral.outlinedBorder",
                    //   px: 1,
                    //   py: 0.5,
                    // }}
                  >
                    {userData.ev_cars.map((car, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemContent>
                          <Typography level="body-md">{car.ev_name}</Typography>
                        </ListItemContent>
                      </ListItem>
                    ))}
                  </List>
                )}
              </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 ">
              <Button
                variant="solid"
                color="danger"
                onClick={handleDeleteAccount}
                sx={{ borderRadius: "xl" }}
                className="w-full sm:w-auto"
              >
                Delete Account
              </Button>
              <Button
                variant="solid"
                color="primary"
                onClick={handleUpdateData}
                sx={{ borderRadius: "xl" }}
                className="w-full sm:w-auto"
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
