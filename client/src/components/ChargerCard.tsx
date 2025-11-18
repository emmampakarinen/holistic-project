import { Button, Card, CardContent, Chip, Typography } from "@mui/joy";
import { ArrowRight } from "lucide-react";
import type { Charger } from "../types/charger";

// A card component to display individual charger details on the charger suggestions page
function ChargerCard({ charger }: { charger: Charger }) {
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
            {charger.name}
          </Typography>

          <Chip
            size="sm"
            variant="soft"
            color="success"
            sx={{ borderRadius: "999px", fontSize: 12 }}
          >
            {charger.type} charger
          </Chip>
        </div>

        <Typography level="body-xs" className="text-slate-500 mt-1">
          <span role="img" aria-label="location">
            📍
          </span>{" "}
          {charger.distanceKm} km from destination
        </Typography>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <Typography level="body-xs" className="text-slate-500">
              Power Output
            </Typography>
            <Typography level="body-md" fontWeight={600}>
              {charger.powerOutputKw} kW
            </Typography>
          </div>

          <div>
            <Typography level="body-xs" className="text-slate-500">
              Est. Charge Time
            </Typography>
            <Typography level="body-md" fontWeight={600}>
              {charger.estimatedChargeTime}
            </Typography>
          </div>

          <div>
            <Typography level="body-xs" className="text-slate-500">
              Connector Type
            </Typography>
            <Typography level="body-md" fontWeight={600}>
              {charger.connectorType}
            </Typography>
          </div>
        </div>

        <Button
          variant="solid"
          color="primary"
          endDecorator={<ArrowRight size={18} />}
          sx={{ mt: 3, borderRadius: "lg", width: "100%" }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

export default ChargerCard;
