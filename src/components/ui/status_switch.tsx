import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Switch } from "@chakra-ui/react";

export function StatusSwitch(props: {
  figure: Figure;
  onFigureEdit: (figure: Figure) => void;
  status: string;
  isPositive: boolean;
}) {
  const { figure, onFigureEdit, status, isPositive } = props;

  const checked = figure.statuses
    .split(",")
    .some((figureStatus) => figureStatus === status);

  const color = isPositive ? "green" : "red";

  return (
    <Switch.Root
      size="sm"
      colorPalette={color}
      key={`${status}-status-${figure.id}`}
      ids={{ root: `${status}-status` }}
      checked={checked}
      onCheckedChange={(e) => {
        if (e.checked) {
          if (!figure.statuses.includes(status)) {
            const statusesArray = figure.statuses.split(",");
            statusesArray.push(status);
            onFigureEdit({
              ...figure,
              statuses: statusesArray.join(","),
            });
          }
        } else {
          if (figure.statuses.includes(status)) {
            const statuses = figure.statuses
              .split(",")
              .filter((figureStatus) => figureStatus !== status)
              .join(",");
            onFigureEdit({
              ...figure,
              statuses: statuses,
            });
          }
        }
      }}
    >
      <Switch.HiddenInput />
      <Switch.Control
        bg={{
          base: checked ? color : "grey",
          _dark: checked ? color : "grey",
        }}
      />
      <Switch.Label fontSize="xs">{status}</Switch.Label>
    </Switch.Root>
  );
}
