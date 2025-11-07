import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Image, Switch } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";

export function StatusSwitch(props: {
  figure: Figure;
  onFigureEdit: (figure: Figure, onlyShowErrors?: boolean) => void;
  status: string;
  isPositive: boolean;
}) {
  const { figure, onFigureEdit, status, isPositive } = props;

  const figureStatuses = figure.statuses ?? "";
  const checked = figureStatuses
    .split(",")
    .some((figureStatus) => figureStatus === status);

  const color = isPositive ? "green" : "red";

  return (
    <Switch.Root
      overflow={"hidden"}
      minWidth="300"
      gapX="0"
      size={{
        base: "lg",
      }}
      colorPalette={color}
      key={`${status}-status-${figure.id}`}
      ids={{ root: `${status}-status` }}
      checked={checked}
      onCheckedChange={(e) => {
        if (e.checked) {
          if (!figureStatuses.includes(status)) {
            onFigureEdit(
              {
                ...figure,
                statuses: `${figureStatuses},${status}`,
              },
              true,
            );
          }
        } else {
          const statuses = figureStatuses
            .split(",")
            .filter((figureStatus) => figureStatus !== status)
            .join(",");
          onFigureEdit(
            {
              ...figure,
              statuses: statuses,
            },
            true,
          );
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
      <Switch.Label>
        <Tooltip content={status}>
          <Image
            src={`${status.toLowerCase()}.png`}
            width="6"
            height="6"
            alt={status}
          />
        </Tooltip>
      </Switch.Label>
    </Switch.Root>
  );
}
