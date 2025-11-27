import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Map, Navigation, Calendar, Star, Info } from "lucide-react";
import { Zap } from "lucide-react";
import Footer from "@/components/Footer";
import logo from "@/assests/logo.png";

const ChargerDetails = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app this would come from an API
  const charger = {
    id,
    name: "GreenCharge Station",
    address: "123 Main Street, Downtown District",
    distance: "0.3 km",
    type: "Slow Charger",
    power: "7.2 kW",
    estimatedTime: "2.5 hours",
    rating: 4.2,
    reviews: 127
  };
  const handleStartCharging = () => {
    navigate(`/charging/${id}`);
  };
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="EV SmartCharge" className="h-10 w-10" />
              <span className="font-bold text-xl">EV SmartCharge</span>
            </div>
            <Button variant="outline" size="sm">
              Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 max-w-7xl py-[32px] pb-[200px]">
        {/* Back Button */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Results</span>
        </button>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Station Header */}
            <div>
              <h1 className="text-4xl font-bold mb-2">{charger.name}</h1>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                <span className="text-lg">{charger.address}</span>
              </div>
            </div>

            {/* Map Placeholder */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-80 bg-muted rounded-lg flex items-center justify-center">
                  <div className="absolute top-4 right-4 bg-card px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 text-sm">
                    <Navigation className="h-4 w-4 text-secondary" />
                    <span className="font-medium">{charger.distance} from destination</span>
                  </div>
                  <div className="text-center">
                    <Map className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
                    <p className="text-lg font-medium text-muted-foreground">
                      Interactive Map View
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charger Specifications */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Charger Specifications</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="bg-accent/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-accent/30 p-2 rounded-lg">
                        <Zap className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Charger Type</p>
                        <p className="font-bold text-lg">{charger.type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-secondary/20 p-2 rounded-lg">
                        <Zap className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Power Output</p>
                        <p className="font-bold text-lg">{charger.power}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-background p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Est. Charge Time</p>
                        <p className="font-bold text-lg">{charger.estimatedTime}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Perfect Match Info */}
            <Card className="bg-secondary/5 border-secondary/20">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <div className="bg-secondary/20 p-2 rounded-full h-fit">
                    <Info className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Perfect Match for Your Trip</h3>
                    <p className="text-muted-foreground">
                      This slow charger is ideal for your 2-hour destination stay. Your vehicle
                      will be fully charged by the time you're ready to leave.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full bg-primary hover:bg-primary/90 h-12" onClick={handleStartCharging}>
                    
                    Start Charging
                  </Button>
                  <Button variant="outline" className="w-full h-12 border-secondary text-secondary hover:bg-secondary/10">
                    <Navigation className="mr-2 h-5 w-5" />
                    Navigate to Charger
                  </Button>
                  <Button variant="outline" className="w-full h-12">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Charger
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Station Rating */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Station Rating</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`h-5 w-5 ${star <= Math.floor(charger.rating) ? "fill-warning text-warning" : "text-muted"}`} />)}
                  </div>
                  <span className="text-2xl font-bold">{charger.rating}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {charger.reviews} reviews
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>;
};
export default ChargerDetails;
