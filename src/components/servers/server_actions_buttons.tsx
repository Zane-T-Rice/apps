import { Box, HStack, Stack, StackProps } from "@chakra-ui/react";
import { Button } from "../recipes/button";

export function ServerActionsButtons<T extends { isUpdatable: boolean }>(
  props: {
    selectedServer?: T | null;
    onServerUpdate?: (selectedServer: T) => Promise<boolean>;
    onServerReboot?: (selectedServer: T) => Promise<boolean>;
    onServerStop?: (selectedServer: T) => Promise<boolean>;
  } & StackProps
) {
  const {
    selectedServer,
    onServerUpdate,
    onServerReboot,
    onServerStop,
    ...stackProps
  } = props;
  const rebootStopWidth = `${onServerReboot && onServerStop ? "1/2" : "100%"}`;
  return (
    <Stack
      direction="column"
      gap={1}
      marginLeft={3}
      marginRight={3}
      {...stackProps}
    >
      <HStack>
        {onServerUpdate ? (
          <Box width={"1/2"}>
            <Button
              variant="safe"
              disabled={!selectedServer || !selectedServer.isUpdatable}
              width="100%"
              onClick={() => selectedServer && onServerUpdate(selectedServer)}
            >
              Start
            </Button>
          </Box>
        ) : null}
        {onServerUpdate ? (
          <Box width={"1/2"}>
            <Button
              variant="safe"
              disabled={!selectedServer || !selectedServer.isUpdatable}
              width="100%"
              onClick={() => selectedServer && onServerUpdate(selectedServer)}
            >
              Update
            </Button>
          </Box>
        ) : null}
      </HStack>
      <HStack>
        {onServerReboot ? (
          <Box width={rebootStopWidth}>
            <Button
              variant="safe"
              disabled={!selectedServer}
              width="100%"
              onClick={() => selectedServer && onServerReboot(selectedServer)}
            >
              Reboot
            </Button>
          </Box>
        ) : null}
        {onServerStop ? (
          <Box width={rebootStopWidth}>
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
