import { Card, CardContent } from "@mui/joy";
import { type LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

type ChargerSpecProps = {
  value: string | number;
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  title: string;
};
export function ChargerSpecCard({ value, title, Icon }: ChargerSpecProps) {
  return (
    <Card className="border-0">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            {typeof value === "number" ? (
              <p className="font-bold text-lg">{value} kW</p>
            ) : (
              <p className="font-bold text-lg">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
