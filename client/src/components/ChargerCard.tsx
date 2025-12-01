import { Button, Card, CardContent, Chip, Typography } from "@mui/joy";
import { ArrowRight } from "lucide-react";
import type { Charger } from "../types/charger";

interface ChargerCardProps {
  charger: Charger;
  onSelect: () => void;
}

// a card component to display individual charger details on the charger suggestions page
export default function ChargerCard({ charger, onSelect }: ChargerCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: "xl",
      }}
    >
      <CardContent>
        <div className="flex items-center justify-between">
          <Typography level="title-lg" fontWeight={600}>
            {charger.displayName.text}
          </Typography>

          <Chip
            size="sm"
            variant="soft"
            color="success"
            sx={{ borderRadius: "999px", fontSize: 12 }}
          >
            {charger.chargingSpeed} charger
          </Chip>
        </div>

        <Typography level="body-xs" className="text-slate-500 mt-1">
          <span role="img" aria-label="location">
            📍
          </span>{" "}
          {charger.distanceMetersWalkingToDestination} meters from destination,{" "}
          {charger.travelTimeSecondsWalkingToDestination} minute walk
        </Typography>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <Typography level="body-xs" className="text-slate-500">
              Power Output
            </Typography>
            <Typography level="body-md" fontWeight={600}>
              {charger.maxChargeRateKw} kW
            </Typography>
          </div>

          <div>
            <Typography level="body-xs" className="text-slate-500">
              Est. Charge Time to 100%
            </Typography>
            <Typography level="body-md" fontWeight={600}>
              {charger.totalTimeToChargeFormattedTime}
            </Typography>
          </div>

          <div>
            <Typography level="body-xs" className="text-slate-500">
              Connector Type
            </Typography>
            <Typography level="body-md" fontWeight={600}>
              {charger.type}
            </Typography>
          </div>

          <div>
            <Typography level="body-xs" className="text-slate-500">
              Battery at the Charger
            </Typography>
            <Typography level="body-md" fontWeight={600}>
              {charger.batteryAtChargerNearDestination}
            </Typography>
          </div>
        </div>

        <Button
          variant="solid"
          color="primary"
          endDecorator={<ArrowRight size={18} />}
          sx={{ mt: 3, borderRadius: "lg", width: "100%" }}
          onClick={() => {
            onSelect();
          }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
