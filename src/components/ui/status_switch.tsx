import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Image, Switch } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";

export function StatusSwitch(props: {
  figure: Figure;
  onFigureEdit: (figure: Figure, onlyShowErrors?: boolean) => void;
  status: string;
}) {
  const { figure, onFigureEdit, status } = props;

  const figureStatuses = figure.statuses
    ? figure.statuses
        .split(",")
        .map((status) => status.trim())
        .join(",")
    : "";
  const checked = figureStatuses
    .split(",")
    .some((figureStatus) => figureStatus === status);

  return (
    <Switch.Root
      overflow={"hidden"}
      minWidth="300"
      gapX="0"
      size={{
        base: "lg",
      }}
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
      <Switch.Label>
        <Tooltip content={status}>
          <Image
            src={`${status.toLowerCase()}.png`}
            width="9"
            height="9"
            alt={status}
            bgColor={{
              _dark: checked ? "rgba(100,200,100,.7)" : "none",
              base: checked ? "rgba(100,200,100,.7)" : "none",
            }}
          />
        </Tooltip>
      </Switch.Label>
    </Switch.Root>
  );
}
