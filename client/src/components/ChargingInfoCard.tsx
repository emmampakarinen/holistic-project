import { Card, CardContent } from "@mui/joy";

type ChargingInfoCardProps = {
  title: string;
  data: string;
  type: "time" | "charge" | "speed";
};

const TYPE_STYLES = {
  time: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100",
    text: "text-blue-600",
  },
  charge: {
    bg: "bg-gradient-to-br from-green-50 to-green-100",
    text: "text-green-600",
  },
  speed: {
    bg: "bg-gradient-to-br from-purple-50 to-purple-100",
    text: "text-purple-600",
  },
} as const;

export function ChargingInfoCard({ title, data, type }: ChargingInfoCardProps) {
  const style = TYPE_STYLES[type];

  return (
    <Card className={`${style.bg} border-0`}>
      <CardContent className="p-4 text-center">
        <p className={`text-md md:text-2xl font-bold mb-1 ${style.text}`}>
          {data} {type === "charge" ? "kWh" : type === "speed" ? "kW" : ""}
        </p>

        <p className={`text-sm ${style.text}`}>{title}</p>
      </CardContent>
    </Card>
  );
}
