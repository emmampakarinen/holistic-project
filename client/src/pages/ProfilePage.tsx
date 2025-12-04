import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
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

  const handleSaveChanges = () => {
    console.log("Saving changes:", formData);
  };

  const handleLogout = () => {
    console.log("Logging out");
    navigate("/");
  };

  const handleDeleteAccount = () => {
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
          </p>
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
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-info" />
                <h2 className="text-xl font-bold">Basic Information</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Full Name
                  </label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Mobile Number
                  </label>
                  <Input
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      handleInputChange("mobileNumber", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">
                  Email Address
                </label>
                <div className="flex gap-2 items-center">
                  <Input value={formData.email} disabled className="flex-1" />
                  <Badge variant="outline" className="shrink-0">
                    Google Account
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span>🔒</span>
                  Email cannot be changed as it's linked to your Google account
                </p>
              </div>
            </div>

            {/* EV Information */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Car className="w-5 h-5 text-success" />
                <h2 className="text-xl font-bold">EV Information</h2>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  EV Car Name
                </label>
                <Input
                  value={formData.evCarName}
                  onChange={(e) =>
                    handleInputChange("evCarName", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-6 border-t border-border">
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                className="w-full sm:w-auto"
              >
                Delete Account
              </Button>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex-1 sm:flex-none"
                >
                  Logout
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-success to-info hover:opacity-90"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

       
      </main>

    </div>
  );
};

export default Profile;
