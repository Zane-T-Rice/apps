import { Box, HStack, Stack, StackProps } from "@chakra-ui/react";
import { Button } from "../recipes/button";

export function ServerActionsButtons<T extends { isUpdatable: boolean }>(
  props: {
    selectedServer?: T | null;
    onServerUpdate?: (selectedServer: T) => Promise<boolean>;
    onServerStop?: (selectedServer: T) => Promise<boolean>;
  } & StackProps
) {
  const { selectedServer, onServerUpdate, onServerStop, ...stackProps } = props;
  const updateStopWidth = `${onServerUpdate && onServerStop ? "1/2" : "100%"}`;
  return (
    <Stack
      direction="column"
      gap={1}
      marginLeft={3}
      marginRight={3}
      {...stackProps}
    >
      <HStack gap={1}>
        {onServerUpdate ? (
          <Box width={updateStopWidth}>
            <Button
              variant="safe"
              disabled={!selectedServer || !selectedServer.isUpdatable}
              width="100%"
              onClick={() => selectedServer && onServerUpdate(selectedServer)}
            >
              Start + Update
            </Button>
          </Box>
        ) : null}
        {onServerStop ? (
          <Box width={updateStopWidth}>
            <Button
              variant="safe"
              disabled={!selectedServer}
              width="100%"
              onClick={() => selectedServer && onServerStop(selectedServer)}
            >
              Stop
            </Button>
          </Box>
        ) : null}
      </HStack>
    </Stack>
  );
}
