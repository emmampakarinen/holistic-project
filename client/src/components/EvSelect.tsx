import { memo, useMemo } from "react";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";

type EvSelectProps = {
  evList: string[];
  selectedCars: string[];
  onChange: (cars: string[]) => void;
};

const EvSelect = memo(({ evList, selectedCars, onChange }: EvSelectProps) => {
  const options = useMemo(
    () =>
      evList.map((name) => (
        <Option key={name} value={name}>
          {name}
        </Option>
      )),
    [evList]
  );

  return (
    <Select
      multiple
      placeholder="Select your EV model(s)"
      startDecorator={<span className="text-xl">🚗</span>}
      value={selectedCars}
      onChange={(_, newValues) => onChange(newValues ?? [])}
      renderValue={() => "Select EV"}
      variant="soft"
      color="neutral"
      sx={{
        borderRadius: "12px",
        paddingBlock: "12px",
        backgroundColor: "#f3f4f6",
        "&:hover": { backgroundColor: "#e5e7eb" },
        "--Select-decoratorChildHeight": "30px",
        minHeight: "52px",
      }}
      slotProps={{
        listbox: {
          sx: {
            maxHeight: "200px",
            overflow: "auto",
          },
        },
      }}
    >
      {evList.length === 0 && (
        <Option value={""} disabled>
          Loading cars...
        </Option>
      )}
      {options}
    </Select>
  );
});

export default EvSelect;
