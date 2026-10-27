import {
  Card,
  Flex,
  Grid,
  GridItem,
  HStack,
  Input,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Server } from "@/app/utils/server-manager-service/server_manager_service_user_servers";
import { useEffect, useMemo, useState } from "react";
import { string, object } from "yup";
import { fetchWithValidateAndToast } from "@/app/utils/fetch/fetch_with_validate_and_toast";
import { useUserServers } from "@/app/utils/server-manager-service/server_manager_service_user_servers";
import { ServerActionsButtons } from "./server_actions_buttons";
import { AutoDataList } from "../ui/auto_data_list";
import { Button } from "../recipes/button";
import { useServerStatusRefresh } from "@/app/utils/use_server_status_refresh";
import { StatusLight } from "../ui/status_light";

const rebootServerSchema = object({
  id: string().required(),
}).stripUnknown();
const updateServerSchema = rebootServerSchema;
const stopServerSchema = rebootServerSchema;

export function MyServersTabContent() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [servers, setServers] = useState<Server[]>([]);
  const [filterText, setFilterText] = useState<string>("");

  const {
    getAllREST: getServers,
    getREST: getServer,
    actionREST: actionServer,
  } = useUserServers();

  useEffect(() => {
    getServers().then((responseServers) => {
      if (responseServers) setServers(responseServers);
      setIsLoading(false);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    refreshingIds,
    isRefreshingAll,
    refreshServer,
    refreshAllServers,
    refreshServerAfterAction,
  } = useServerStatusRefresh({ servers, setServers, getServer, getServers });

  const onServerUpdate = async (serverToUpdate: Server): Promise<boolean> => {
    const title = `Updating server ${serverToUpdate.applicationName}/${serverToUpdate.containerName}`;
    const server = await fetchWithValidateAndToast({
      title,
      setErrors: () => {},
      validateCallback: () => {
        updateServerSchema.validateSync(serverToUpdate, {
          abortEarly: false,
        });
        return Object.keys(serverToUpdate) as (keyof Server)[];
      },
      fetchCallback: async () => await actionServer(serverToUpdate, "update"),
    });
    if (!server) return false;

    refreshServerAfterAction(serverToUpdate.id);
    return true;
  };

  const onServerStop = async (serverToReboot: Server): Promise<boolean> => {
    const title = `Stopping server ${serverToReboot.applicationName}/${serverToReboot.containerName}`;
    const server = await fetchWithValidateAndToast({
      title,
      setErrors: () => {},
      validateCallback: () => {
        stopServerSchema.validateSync(serverToReboot, {
          abortEarly: false,
        });
        return Object.keys(serverToReboot) as (keyof Server)[];
      },
      fetchCallback: async () => await actionServer(serverToReboot, "stop"),
    });
    if (!server) return false;

    refreshServerAfterAction(serverToReboot.id);
    return true;
  };

  // Show the servers that match the filter: by application name and then by container name.
  const visibleServers = useMemo(() => {
    const filter = filterText.trim().toLowerCase();
    const matchesFilter = (server: Server) =>
      !filter ||
      [
        server.applicationName,
        server.containerName,
        ...server.ports.map((port) => String(port.number)),
      ].some((value) => value.toLowerCase().includes(filter));

    return servers
      .filter(matchesFilter)
      .sort(
        (a, b) =>
          a.applicationName.localeCompare(b.applicationName) ||
          a.containerName.localeCompare(b.containerName),
      );
  }, [servers, filterText]);

  const serverToServerInfo = (server: Server) => ({
    Host: `${new URL(server.host.url).hostname}`,
    Ports: `${Object.keys(
      server.ports
        .map((port) => port.number)
        .reduce((a, b) => ({ ...a, [b]: true }), {}),
    ).join(", ")}`,
  });

  return isLoading ? (
    <Stack direction="column" marginLeft={2} marginRight={2}>
      <Skeleton height={50} variant="shine" />
      <Skeleton height={250} variant="shine" />
      <Skeleton height={50} variant="shine" />
    </Stack>
  ) : (
    <Stack direction="column" gap={6}>
      <HStack marginLeft={2} marginRight={2} gap={2}>
        <Input
          placeholder="Filter by application, container or port"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          maxWidth="md"
        />
        <Button
          variant="outline"
          flexShrink={0}
          // Not disabled while refreshing: a disabled button loses the keyboard focus.
          aria-disabled={isRefreshingAll}
          onClick={() => {
            if (!isRefreshingAll) refreshAllServers();
          }}
        >
          Refresh statuses
        </Button>
      </HStack>
      {visibleServers.length === 0 && filterText.trim() ? (
        <Text marginLeft={2} opacity={0.7}>
          No servers match the filter.
        </Text>
      ) : null}
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
          xl: "repeat(4, 1fr)",
          "2xl": "repeat(5, 1fr)",
        }}
        gap="4"
        marginLeft={2}
        marginRight={2}
      >
        {visibleServers.map((server) => (
          <GridItem colSpan={1} key={`my-servers-grid-item-${server.id}`}>
            <Card.Root
              variant="elevated"
              width="100%"
              height="100%"
              key={`my-servers-${server.id}`}
            >
              <Card.Body>
                <Stack gap={6}>
                  <HStack
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Card.Title>{`${server.applicationName}/${server.containerName}`}</Card.Title>
                    {/* As tall as one line of the title, so the light stays beside its first line. */}
                    <Flex alignItems="center" height="1lh" textStyle="lg">
                      <StatusLight
                        status={server.status}
                        onRefresh={() => refreshServer(server.id)}
                        isRefreshing={refreshingIds.has(server.id)}
                      />
                    </Flex>
                  </HStack>
                  <AutoDataList record={serverToServerInfo(server)} />
                  <ServerActionsButtons
                    selectedServer={server}
                    onServerUpdate={onServerUpdate}
                    onServerStop={onServerStop}
                    marginLeft={0}
                    marginRight={0}
                  />
                </Stack>
              </Card.Body>
            </Card.Root>
          </GridItem>
        ))}
      </Grid>
    </Stack>
  );
}
