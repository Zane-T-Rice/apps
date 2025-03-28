import { Spinner, Stack, Text } from "@chakra-ui/react";
import CRUDTable from "../ui/crud_table";
import { Button } from "../recipes/button";
import {
  createServer,
  deleteServer,
  editServer,
  getServers,
  rebootServer,
  updateServer,
  Server,
} from "@/app/utils/server-manager-service/server-manager-service";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { string, boolean, object } from "yup";
import { AlertDialog } from "../ui/alert_dialog";
import { AutoDataList } from "../ui/auto_data_list";
import { fetchWithValidateAndToast } from "@/app/utils/fetch/fetch_with_validate_and_toast";

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
const rebootServerSchema = deleteServerSchema;
const updateServerSchema = deleteServerSchema;

export function ServerTabContent(props: {
  selectedServer: Server | null;
  setSelectedServer: Dispatch<SetStateAction<Server | null>>;
}) {
  const { selectedServer, setSelectedServer } = props;
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

  useEffect(() => {
    getServers().then((responseServers) => {
      if (responseServers) setServers(responseServers);
      setIsLoading(false);
    });
  }, []);

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
    const title = `Deleting ${serverToDelete.applicationName}/${serverToDelete.containerName}`;
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

    return true;
  };

  const onServerReboot = async (serverToReboot: Server): Promise<boolean> => {
    const title = `Rebooting ${serverToReboot.applicationName}/${serverToReboot.containerName}`;
    const server = await fetchWithValidateAndToast({
      title,
      setErrors: () => {},
      validateCallback: () => {
        return rebootServerSchema.validateSync(serverToReboot, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await rebootServer(validate),
    });
    if (!server) return false;

    return true;
  };

  const onServerUpdate = async (serverToUpdate: Server): Promise<boolean> => {
    const title = `Updating ${serverToUpdate.applicationName}/${serverToUpdate.containerName}`;
    const server = await fetchWithValidateAndToast({
      title,
      setErrors: () => {},
      validateCallback: () => {
        return updateServerSchema.validateSync(serverToUpdate, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await updateServer(validate),
    });
    if (!server) return false;

    return true;
  };

  return isLoading ? (
    <Spinner
      color="blue"
      size="xl"
      borderWidth="thick"
      marginLeft="45%"
      marginTop="15%"
    />
  ) : (
    <>
      <CRUDTable
        records={servers}
        style={{}}
        onRowSelect={onServerSelect}
        idKey="id"
        selectedRecordId={selectedServer?.id}
        onCreate={onServerCreate}
        onCreateErrors={createErrors}
        creationRecord={createServerRecord}
        onEdit={onServerEdit}
        onEditErrors={editErrors}
        onDelete={onServerDelete}
      />
      <Stack direction="row" gap={1} marginLeft={2} marginRight={3}>
        <AlertDialog
          trigger={
            <Button variant="safe" disabled={!selectedServer} width="1/2">
              Reboot
            </Button>
          }
          body={
            selectedServer ? (
              <Stack direction="column">
                <Text>Are you sure that you want to reboot:</Text>
                <AutoDataList record={selectedServer} />
              </Stack>
            ) : null
          }
          onConfirm={() => selectedServer && onServerReboot(selectedServer)}
          confirmText="Reboot"
        />
        <AlertDialog
          trigger={
            <Button variant="safe" disabled={!selectedServer} width="1/2">
              Update
            </Button>
          }
          body={
            selectedServer ? (
              <Stack direction="column">
                <Text>Are you sure that you want to update:</Text>
                <AutoDataList record={selectedServer} />
              </Stack>
            ) : null
          }
          onConfirm={() => selectedServer && onServerUpdate(selectedServer)}
          confirmText="Update"
        />
      </Stack>
    </>
  );
}
