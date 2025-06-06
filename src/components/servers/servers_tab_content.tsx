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
  selectedServer: Server | null;
  setSelectedServer: Dispatch<SetStateAction<Server | null>>;
}) {
  const { selectedHost, selectedServer, setSelectedServer } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [servers, setServers] = useState<Server[]>([]);
  const [createErrors, setCreateErrors] = useState<{
    [Property in keyof Server]?: string;
  }>({});
  const [editErrors, setEditErrors] = useState<{
    [Property in keyof Server]?: string;
  }>({});

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

  const onServerCreate = async (newServer: Server): Promise<boolean> => {
    const title = `Creating server ${newServer.applicationName}/${newServer.containerName}`;
    const server = await fetchWithValidateAndToast({
      title,
      setErrors: setCreateErrors,
      validateCallback: () => {
        return createServerSchema.validateSync(newServer, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await createServer(validate),
    });
    if (!server) return false;

    // Update servers with new record
    setServers((prev) => {
      return [...prev, server];
    });

    return true;
  };

  const onServerEdit = async (newServer: Server): Promise<boolean> => {
    const title = `Editing server ${newServer.applicationName}/${newServer.containerName}`;
    const server = await fetchWithValidateAndToast({
      title,
      setErrors: setEditErrors,
      validateCallback: () => {
        return editServerSchema.validateSync(newServer, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await editServer(validate),
    });
    if (!server) return false;

    // Update servers with edited record if success
    setServers((prev) => {
      return prev.map((currentServer) =>
        currentServer.id === server.id ? server : currentServer
      );
    });

    return true;
  };

  const onServerDelete = async (serverToDelete: Server): Promise<boolean> => {
    const title = `Deleting server ${serverToDelete.applicationName}/${serverToDelete.containerName}`;
    const server = await fetchWithValidateAndToast({
      title,
      setErrors: setEditErrors,
      validateCallback: () => {
        return deleteServerSchema.validateSync(serverToDelete, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await deleteServer(validate),
    });
    if (!server) return false;

    setServers((prev) => {
      return prev.filter((currentServer) => currentServer.id !== server.id);
    });
    setSelectedServer(null);

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

  const onServerStop = async (serverToStop: Server): Promise<boolean> => {
    const title = `Stopping server ${serverToStop.applicationName}/${serverToStop.containerName}`;
    const server = await fetchWithValidateAndToast({
      title,
      setErrors: () => {},
      validateCallback: () => {
        return stopServerSchema.validateSync(serverToStop, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await actionServer(validate, "stop"),
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
        onRowSelect={onServerSelect}
        idKey="id"
        selectedRecordId={selectedServer?.id}
        onCreate={onServerCreate}
        onCreateErrors={createErrors}
        creationRecord={createServerRecord}
        onEdit={onServerEdit}
        onEditErrors={editErrors}
        onDelete={onServerDelete}
        marginLeft={3}
        marginRight={3}
        createPermission="admin:servers"
        editPermission="admin:servers"
        deletePermission="admin:servers"
      />
      <ServerActionsButtons
        selectedServer={selectedServer}
        onServerUpdate={onServerUpdate}
        onServerStop={onServerStop}
      />
    </Stack>
  );
}
