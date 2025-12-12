import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Image } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "../recipes/button";

export function StatusSwitch(props: {
  figure: Figure;
  onFigureEdit: (figure: Figure, silent?: boolean) => void;
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
    <Tooltip content={status}>
      <Button
        width={10}
        padding={0}
        margin={0}
        onClick={() => {
          if (!checked) {
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
        <Image
          src={`/apps/${status.toLowerCase()}.png`}
          alt={status}
          bgColor={{
            _dark: checked ? "rgba(100,200,100,.7)" : "none",
            base: checked ? "rgba(100,200,100,.7)" : "none",
          }}
        />
      </Button>
    </Tooltip>
  );
}
