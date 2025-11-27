import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { User, Car } from "lucide-react";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";


const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "John Anderson",
    mobileNumber: "+1 (555) 123-4567",
    email: "john.anderson@gmail.com",
    evCarName: "Tesla Model 3 Long Range",
  });

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
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="EV SmartCharge" className="h-10 w-10" />
              <span className="font-bold text-xl">EV SmartCharge</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/history")}
                className="text-muted-foreground"
              >
                History
              </Button>
              <Button variant="ghost" className="text-info border-b-2 border-info">
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and EV information
          </p>
        </div>

        <Card className="overflow-hidden">
          {/* Gradient Header */}
          <div className="h-32 bg-gradient-to-r from-success via-info to-secondary" />

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
                  <label className="text-sm font-medium mb-2 block">Full Name</label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Mobile Number</label>
                  <Input
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">Email Address</label>
                <div className="flex gap-2 items-center">
                  <Input
                    value={formData.email}
                    disabled
                    className="flex-1"
                  />
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
                <label className="text-sm font-medium mb-2 block">EV Car Name</label>
                <Input
                  value={formData.evCarName}
                  onChange={(e) => handleInputChange("evCarName", e.target.value)}
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

        {/* Permanently Delete Button */}
        <div className="mt-8 flex justify-center">
          <Button
            variant="destructive"
            size="lg"
            onClick={handleDeleteAccount}
          >
            Permanently Delete Account
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
