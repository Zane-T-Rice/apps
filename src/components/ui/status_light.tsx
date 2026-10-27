import { Box, chakra } from "@chakra-ui/react";
import { Tooltip } from "./tooltip";

// Docker container states, plus "stopped" (no container exists) and "unknown" (the host could not be asked).
const STATUS_COLORS: Record<string, string> = {
  running: "green.500",
  paused: "yellow.500",
  restarting: "yellow.500",
  created: "yellow.500",
  removing: "yellow.500",
  exited: "red.500",
  dead: "red.500",
  stopped: "gray.500",
  unknown: "gray.500",
};

// A traffic light style circle for the status of a server. Hover for the name of the status.
// When onRefresh is given, clicking the light refreshes the status.
export function StatusLight(props: {
  status: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const { status, onRefresh, isRefreshing } = props;
  const light = {
    display: "inline-block",
    flexShrink: 0,
    width: "0.9rem",
    height: "0.9rem",
    borderRadius: "full",
    bg: STATUS_COLORS[status] ?? "gray.500",
    opacity: isRefreshing ? 0.4 : 1,
    transition: "opacity 0.2s",
  } as const;

  return (
    <Tooltip content={status} positioning={{ placement: "top" }}>
      {onRefresh ? (
        <chakra.button
          type="button"
          aria-label={`Status: ${status}. Refresh status.`}
          aria-busy={isRefreshing}
          cursor={isRefreshing ? "progress" : "pointer"}
          // Do not also select the row or card the light is in.
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            // Ignore refresh requests while one is already running.
            if (!isRefreshing) onRefresh();
          }}
          // The text color, so the ring shows on a selected (blue) row as well as on the page.
          _focusVisible={{
            outline: "2px solid",
            outlineColor: "fg",
            outlineOffset: "2px",
          }}
          {...light}
        />
      ) : (
        <Box role="img" aria-label={`Status: ${status}`} {...light} />
      )}
    </Tooltip>
  );
}
