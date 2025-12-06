import { Card, CardContent } from "@mui/joy";
import type { LucideIcon } from "lucide-react"; // nicer alias than the long type
import type { ReactNode } from "react";

type DetailRow = {
  label: string;
  value: ReactNode;
};

type ChargingDetailsProps = {
  title: string;
  Icon: LucideIcon;
  items: DetailRow[];
  iconColor?: string;
};

export function ChargingDetails({
  title,
  Icon,
  items,
  iconColor,
}: ChargingDetailsProps) {
  return (
    <Card className="border-0">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <h3 className="font-bold text-lg">{title}</h3>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex justify-between gap-4">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold text-right">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
