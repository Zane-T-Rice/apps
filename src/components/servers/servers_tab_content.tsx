import { Skeleton, Stack } from "@chakra-ui/react";
import CRUDTable from "../ui/crud_table";
import {
  Server,
  useServers,
} from "@/app/utils/server-manager-service/server_manager_service_servers";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { string, boolean, object } from "yup";
import { fetchWithValidateAndToast } from "@/app/utils/fetch/fetch_with_validate_and_toast";
import { Host } from "@/app/utils/server-manager-service/server_manager_service_hosts";
import { ServerActionsButtons } from "./server_actions_buttons";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";

const createServerSchema = object({
  applicationName: string().required(),
  containerName: string().required(),
  isInResponseChain: boolean().required(),
  isUpdatable: boolean().required(),
}).stripUnknown();

const editServerSchema = createServerSchema
  .concat(
    object({
      id: string().required(),
    })
  )
  .stripUnknown();

const deleteServerSchema = object({
  id: string().required(),
}).stripUnknown();
const stopServerSchema = deleteServerSchema;
const updateServerSchema = deleteServerSchema;

export function ServersTabContent(props: {
  selectedHost: Host;
  selectedServer?: Server;
  setSelectedServer: Dispatch<SetStateAction<Server | undefined>>;
}) {
  const { selectedHost, selectedServer, setSelectedServer } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [servers, setServers] = useState<Server[]>([]);

  const [createServerRecord] = useState<Server>({
    id: "",
    applicationName: "",
    containerName: "",
    isInResponseChain: false,
    isUpdatable: true,
  });

  const {
    getAllREST: getServers,
    createREST: createServer,
    editREST: editServer,
    deleteREST: deleteServer,
    actionREST: actionServer,
  } = useServers(selectedHost);

  useEffect(() => {
    if (!selectedHost) return;

    getServers().then((responseServers) => {
      if (responseServers) setServers(responseServers);
      setIsLoading(false);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHost]);

  const onServerSelect = (server: Server) => {
    setSelectedServer(server);
  };

  const {
    onResourceCreate: onServerCreate,
    onResourceEdit: onServerEdit,
    onResourceDelete: onServerDelete
  } = useOnCRUD<
    Server,
    typeof createServerSchema,
    typeof editServerSchema,
    typeof deleteServerSchema
  >({
    resourceNameKey: "containerName",
    createResourceSchema: createServerSchema,
    editResourceSchema: editServerSchema,
    deleteResourceSchema: deleteServerSchema,
    createResource: createServer,
    editResource: editServer,
    deleteResource: deleteServer,
    setResources: setServers,
    setSelectedResource: setSelectedServer,
  })

  const onServerUpdate = async (serverToUpdate: Server): Promise<boolean> => {
    const title = `Updating server ${serverToUpdate.applicationName}/${serverToUpdate.containerName}`;
    const server = await fetchWithValidateAndToast({
      title,
      setErrors: () => { },
      validateCallback: () => {
        updateServerSchema.validateSync(serverToUpdate, {
          abortEarly: false,
        });
        return Object.keys(serverToUpdate) as (keyof Server)[]
      },
      fetchCallback: async () => await actionServer(serverToUpdate, "update"),
    });
    if (!server) return false;

    return true;
  };

  const onServerStop = async (serverToStop: Server): Promise<boolean> => {
    const title = `Stopping server ${serverToStop.applicationName}/${serverToStop.containerName}`;
    const server = await fetchWithValidateAndToast({
      title,
      setErrors: () => { },
      validateCallback: () => {
        stopServerSchema.validateSync(serverToStop, {
          abortEarly: false,
        });
        return Object.keys(serverToStop) as (keyof Server)[]
      },
      fetchCallback: async () => await actionServer(serverToStop, "stop"),
    });
    if (!server) return false;

    return true;
  };

  return isLoading ? (
    <Stack direction="column" marginLeft={2} marginRight={2}>
      <Skeleton height={50} variant="shine" />
      <Skeleton height={250} variant="shine" />
      <Skeleton height={50} variant="shine" />
    </Stack>
  ) : (
    <Stack direction="column" gapY={1.5}>
      <CRUDTable
        records={servers}
        style={{}}
        idKey="id"
        onRowSelect={onServerSelect}
        selectedRecordId={selectedServer?.id}
        createPermission="server-manager:admin"
        creationRecord={createServerRecord}
        onCreate={onServerCreate}
        createResourceSchema={createServerSchema}
        editPermission="server-manager:admin"
        onEdit={onServerEdit}
        editResourceSchema={editServerSchema}
        deletePermission="server-manager:admin"
        onDelete={onServerDelete}
        marginLeft={3}
        marginRight={3}
      />
      <ServerActionsButtons
        selectedServer={selectedServer}
        onServerUpdate={onServerUpdate}
        onServerStop={onServerStop}
      />
    </Stack>
  );
}
