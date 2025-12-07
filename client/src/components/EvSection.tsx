import {
  Chip,
  FormControl,
  FormLabel,
  Option,
  Select,
  Typography,
} from "@mui/joy";
import { Car } from "lucide-react";
import { memo, useMemo } from "react";

type EvSectionProps = {
  evList: string[];
  selectedCars: string[];
  initialCars: string[];
  removeCar: (car: string) => void;
  handleInputChange: (field: string, value: any) => void;
};

export const EvSection = memo(
  ({
    evList,
    selectedCars,
    initialCars,
    removeCar,
    handleInputChange,
  }: EvSectionProps) => {
    const existingCars = useMemo(
      () => selectedCars.filter((car) => initialCars.includes(car)),
      [selectedCars, initialCars]
    );

    const newCars = useMemo(
      () => selectedCars.filter((car) => !initialCars.includes(car)),
      [selectedCars, initialCars]
    );

    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Car className="w-5 h-5 text-emerald-500" />
          <Typography level="title-lg">EV Information</Typography>
        </div>

        <FormControl>
          <FormLabel>Select Your EV(s)</FormLabel>
          <Select
            multiple
            placeholder="Select your EV models"
            value={selectedCars}
            onChange={(_, newValues) =>
              handleInputChange("selectedCars", newValues)
            }
            renderValue={() => "Select EV"}
          >
            {evList.map((car) => (
              <Option key={car} value={car}>
                {car}
              </Option>
            ))}
          </Select>
        </FormControl>

        {existingCars.length > 0 && (
          <div className="mt-4">
            <Typography level="body-sm" className="mb-1 text-slate-500">
              Saved EVs
            </Typography>
            <div className="flex flex-wrap gap-2">
              {existingCars.map((car, index) => (
                <Chip
                  key={`${car}-${index}`}
                  variant="soft"
                  color="primary"
                  onClick={() => removeCar(car)}
                  endDecorator={<span className="text-xs ml-1">✕</span>}
                >
                  {car}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Newly added EVs */}
        {newCars.length > 0 && (
          <div className="mt-4">
            <Typography level="body-sm" className="mb-1 text-emerald-600">
              Newly added (not yet saved)
            </Typography>
            <div className="flex flex-wrap gap-2">
              {newCars.map((car) => (
                <Chip
                  key={car}
                  variant="soft"
                  color="success"
                  onClick={() =>
                    handleInputChange(
                      "selectedCars",
                      selectedCars.filter((c) => c !== car)
                    )
                  }
                  endDecorator={
                    <button
                      onClick={() => removeCar(car)}
                      className="text-xs ml-1"
                    >
                      ✕
                    </button>
                  }
                >
                  {car}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }
);
