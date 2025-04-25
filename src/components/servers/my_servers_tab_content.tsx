import { Card, Grid, GridItem, Skeleton, Stack } from "@chakra-ui/react";
import { Server } from "@/app/utils/server-manager-service/server_manager_service_user_servers";
import { useEffect, useState } from "react";
import { string, object } from "yup";
import { fetchWithValidateAndToast } from "@/app/utils/fetch/fetch_with_validate_and_toast";
import { useUserServers } from "@/app/utils/server-manager-service/server_manager_service_user_servers";
import { ServerActionsButtons } from "./server_actions_buttons";
import { AutoDataList } from "../ui/auto_data_list";

const rebootServerSchema = object({
  id: string().required(),
}).stripUnknown();
const updateServerSchema = rebootServerSchema;
const stopServerSchema = rebootServerSchema;

export function MyServersTabContent() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [servers, setServers] = useState<Server[]>([]);

  const { getAllREST: getServers, actionREST: actionServer } = useUserServers();

  useEffect(() => {
    getServers().then((responseServers) => {
      if (responseServers) setServers(responseServers);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onServerReboot = async (serverToReboot: Server): Promise<boolean> => {
    const title = `Rebooting server ${serverToReboot.applicationName}/${serverToReboot.containerName}`;
    const server = await fetchWithValidateAndToast({
      title,
      setErrors: () => {},
      validateCallback: () => {
        return rebootServerSchema.validateSync(serverToReboot, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) =>
        await actionServer(validate, "restart"),
    });
    if (!server) return false;

    return true;
  };

  const onServerUpdate = async (serverToUpdate: Server): Promise<boolean> => {
    const title = `Updating server ${serverToUpdate.applicationName}/${serverToUpdate.containerName}`;
    const server = await fetchWithValidateAndToast({
      title,
      setErrors: () => {},
      validateCallback: () => {
        return updateServerSchema.validateSync(serverToUpdate, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await actionServer(validate, "update"),
    });
    if (!server) return false;

    return true;
  };

  const onServerStop = async (serverToReboot: Server): Promise<boolean> => {
    const title = `Stopping server ${serverToReboot.applicationName}/${serverToReboot.containerName}`;
    const server = await fetchWithValidateAndToast({
      title,
      setErrors: () => {},
      validateCallback: () => {
        return stopServerSchema.validateSync(serverToReboot, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await actionServer(validate, "stop"),
    });
    if (!server) return false;

    return true;
  };

  const serverToServerInfo = (server: Server) => ({
    Host: `${new URL(server.host.url).hostname}`,
    Ports: `${Object.keys(
      server.ports
        .map((port) => port.number)
        .reduce((a, b) => ({ ...a, [b]: true }), {})
    ).join(", ")}`,
  });

  return isLoading ? (
    <Stack direction="column" marginLeft={2} marginRight={2}>
      <Skeleton height={50} variant="shine" />
      <Skeleton height={250} variant="shine" />
      <Skeleton height={50} variant="shine" />
    </Stack>
  ) : (
    <Grid
      templateColumns={{
        base: "repeat(1, 1fr)",
        md: "repeat(2, 1fr)",
        lg: "repeat(3, 1fr)",
      }}
      gap="0"
    >
      {servers.map((server, index) => {
        return (
          <GridItem
            colSpan={1}
            key={`navigation-bar-grid-item-${index}`}
            justifyItems="center"
          >
            <Card.Root
              variant="elevated"
              width="95%"
              height="95%"
              key={`navigation-bar-${index}`}
            >
              <Card.Body>
                <Stack gap={6}>
                  <Card.Title>{`${server.applicationName}/${server.containerName}`}</Card.Title>
                  <AutoDataList record={serverToServerInfo(server)} />
                  <ServerActionsButtons
                    selectedServer={server}
                    onServerReboot={onServerReboot}
                    onServerUpdate={onServerUpdate}
                    onServerStop={onServerStop}
                    marginLeft={0}
                    marginRight={0}
                  />
                </Stack>
              </Card.Body>
            </Card.Root>
          </GridItem>
        );
      })}
    </Grid>
  );
}
