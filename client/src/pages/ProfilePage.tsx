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
import { User, Car } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();

  // Read raw user data from localStorage (set by login/register)
  const rawUserData = localStorage.getItem("userData");
  const googleEmail = localStorage.getItem("google_email");

  // Build initial values for the form
  let initial = {
    fullName: "",
    mobileNumber: "",
    email: googleEmail || "",
    evCarName: "",
  };

  if (rawUserData) {
    try {
      const user = JSON.parse(rawUserData);

      // Name: support both shapes (register payload & DB row)
      initial.fullName = user.fullName || user.name || initial.fullName;

      // Mobile: only in register payload for now
      initial.mobileNumber = user.mobile || initial.mobileNumber;

      // Email: from register payload, DB, or Google
      initial.email =
        user.emailAddress || user.email || initial.email;

      // EV car name:
      // 1) If we stored selectedCars (array of strings), show them
      if (Array.isArray(user.selectedCars) && user.selectedCars.length > 0) {
        initial.evCarName = user.selectedCars.join(", ");
      }
      // 2) Or if we have ev_cars from DB (JSON string), show first one
      else if (user.ev_cars) {
        try {
          const cars = JSON.parse(user.ev_cars);
          if (Array.isArray(cars) && cars.length > 0) {
            initial.evCarName = String(cars[0]);
          }
        } catch {

        }
      }
    } catch (e) {
      console.error("Failed to parse userData from localStorage", e);
    }
  }

  const [formData, setFormData] = useState(initial);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteAccount = () => {
    console.log("Permanently deleting account");
  };

  const handleUpdateData = () => {
    console.log("Permanently deleting account");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and EV information
          </Typography>
        </div>

        <Card className="overflow-hidden border-0 shadow-lg">
          {/* Gradient Header */}
          <div className="h-32 bg-[linear-gradient(90deg,#30C67C_0%,#2979FF_100%)]" />

          <CardContent className="p-8 -mt-16">
            {/* Avatar */}
            <div className="flex justify-center mb-8">
              <Avatar className="w-32 h-32 border-4 border-card shadow-lg">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                <AvatarFallback className="text-3xl">JA</AvatarFallback>
              </Avatar>
            </div>

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
                    variant="outlined"
                    sx={{
                      borderRadius: "lg",
                      borderColor: "neutral.outlinedBorder",
                      px: 1,
                      py: 0.5,
                    }}
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
      </main>
    </div>
  );
};

export default Profile;
