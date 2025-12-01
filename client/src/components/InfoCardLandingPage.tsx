import { Card } from "@mui/joy";

type InfoCardProps = {
  title: string;
  description: string;
};

// A small card component to display an the user's current info when planning a trip on the
// charger suggestions page

export function InfoCardLandingPage({ title, description }: InfoCardProps) {
  return (
    <Card variant="soft" className="p-6 text-center rounded-xl">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </Card>
  );
}
