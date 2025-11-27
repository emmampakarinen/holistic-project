import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Battery, MapPin, Thermometer } from "lucide-react";
import { Zap } from "lucide-react";
import Footer from "@/components/Footer";
import logo from "@/assests/logo.png";

const ChargingProgress = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(75);

  // Mock charging data
  const chargingData = {
    stationName: "SuperCharge Station",
    chargerType: "Slow (Level 2)",
    powerOutput: "7.4 kW",
    location: "0.3 mi away",
    currentLevel: 75,
    startingLevel: 35,
    energyAdded: 30.0,
    estimatedRange: 225,
    chargingSpeed: "7.4 kW",
    timeRemaining: "25 min",
    currentCharge: "56.2 kWh",
    estimatedFullCharge: "3:45 PM",
    startedAt: "2:30 PM",
    temperature: 12,
    targetLevel: 100
  };
  const handleStopCharging = () => {
    navigate(`/charger/${id}`);
  };
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-px">
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
      <main className="container mx-auto px-4 py-6 max-w-7xl pt-[32px] pb-[200px]">
        <button onClick={() => navigate(`/charger/${id}`)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Charger Details</span>
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Charging in Progress</h1>
          <p className="text-muted-foreground">
            Your vehicle is currently charging at {chargingData.stationName}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Circle */}
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col items-center mb-8">
                  {/* Circular Progress */}
                  <div className="relative w-64 h-64 mb-8">
                    <svg className="transform -rotate-90 w-64 h-64">
                      <circle cx="128" cy="128" r="112" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-muted" />
                      <circle cx="128" cy="128" r="112" stroke="hsl(200, 100%, 60%)" strokeWidth="16" fill="transparent" strokeDasharray={`${2 * Math.PI * 112}`} strokeDashoffset={`${2 * Math.PI * 112 * (1 - progress / 100)}`} className="transition-all duration-500" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-6xl font-bold text-primary">{progress}%</div>
                      <div className="text-muted-foreground mt-1">Charged</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                    <Card className="bg-secondary/10 border-secondary/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-secondary mb-1">
                          {chargingData.timeRemaining}
                        </div>
                        <div className="text-sm text-muted-foreground">Time Remaining</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/10 border-primary/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {chargingData.currentCharge}
                        </div>
                        <div className="text-sm text-muted-foreground">Current Charge</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-accent border-accent-foreground/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-accent-foreground mb-1">
                          {chargingData.chargingSpeed}
                        </div>
                        <div className="text-sm text-muted-foreground">Charging Speed</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Time Info */}
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-secondary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Estimated Full Charge</div>
                      <div className="text-xl font-bold">
                        {chargingData.estimatedFullCharge}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Started At</div>
                    <div className="text-xl font-bold">{chargingData.startedAt}</div>
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Charging Timeline</span>
                    <span className="text-muted-foreground">
                      Target: {chargingData.targetLevel}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={progress} className="h-3" />
                    <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                      <span>0%</span>
                      <span>{progress}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Stop Button */}
                <Button variant="destructive" className="w-full h-12 text-lg font-semibold" onClick={handleStopCharging}>
                  
                  Stop Charging
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Charger Details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg">Charger Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Station Name</span>
                    <span className="font-semibold">{chargingData.stationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Charger Type</span>
                    <span className="font-semibold">{chargingData.chargerType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Power Output</span>
                    <span className="font-semibold">{chargingData.powerOutput}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {chargingData.location}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Battery Status */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Battery className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg">Battery Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Level</span>
                    <span className="font-semibold">{chargingData.currentLevel}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Starting Level</span>
                    <span className="font-semibold">{chargingData.startingLevel}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Energy Added</span>
                    <span className="font-semibold">{chargingData.energyAdded} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Range</span>
                    <span className="font-semibold">{chargingData.estimatedRange} miles</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Temperature Warning */}
            <Card className="bg-warning/10 border-warning/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-warning/20 p-2 rounded-lg">
                    <Thermometer className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Current Temperature</h3>
                    <p className="text-3xl font-bold text-warning mb-1">
                      {chargingData.temperature}°C
                    </p>
                    <p className="text-sm text-muted-foreground">Auto-detected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>;
};
export default ChargingProgress;