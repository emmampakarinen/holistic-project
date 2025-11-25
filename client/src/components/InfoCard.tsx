import { Typography } from "@mui/joy";

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

// A small card component to display an the user's current info when planning a trip on the
// charger suggestions page
export default function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <Typography level="body-xs" className="text-slate-500">
          {label}
        </Typography>
        <Typography level="body-md" fontWeight={600}>
          {value}
        </Typography>
      </div>
    </div>
  );
}
