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
import { string, boolean, object, ValidationError, InferType } from "yup";
import { yupErrorsToMap } from "@/app/utils/yup_errors_to_map";
import { toaster } from "@/components/ui/toaster";
import { AlertDialog } from "../ui/alert_dialog";
import { AutoDataList } from "../ui/auto_data_list";

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
    // Validate input
    let validate: InferType<typeof createServerSchema> | null = null;

    try {
      validate = createServerSchema.validateSync(newServer, {
        abortEarly: false,
      });
      setCreateErrors({});
    } catch (err) {
      setCreateErrors(yupErrorsToMap(err as ValidationError));
    }

    if (!validate) return false;

    // Make backend call
    const server = await createServer(validate);
    if (!server) {
      toaster.create({
        title: `Creating server ${newServer.applicationName}/${newServer.containerName}`,
        description: "Failed",
        type: "error",
      });
      return false;
    }

    toaster.create({
      title: `Creating server ${newServer.applicationName}/${newServer.containerName}`,
      description: "Finished",
      type: "success",
    });

    // Update servers with new record
    setServers((prev) => {
      return [...prev, server];
    });

    return true;
  };

  const onServerEdit = async (newServer: Server): Promise<boolean> => {
    // Validate input
    let validate: InferType<typeof editServerSchema> | null = null;

    try {
      validate = editServerSchema.validateSync(newServer, {
        abortEarly: false,
      });
      setEditErrors({});
    } catch (err) {
      setEditErrors(yupErrorsToMap(err as ValidationError));
    }

    if (!validate) return false;

    // Make backend call
    const server = await editServer(validate);
    if (!server) {
      toaster.create({
        description: "Edit of server failed.",
        type: "error",
      });
      return false;
    }

    // Update servers with edited record if success
    setServers((prev) => {
      return prev.map((currentServer) =>
        currentServer.id === server.id ? server : currentServer
      );
    });

    return true;
  };

  const onServerDelete = async (serverToDelete: Server): Promise<boolean> => {
    // Validate input
    let validate: InferType<typeof deleteServerSchema> | null = null;

    try {
      validate = deleteServerSchema.validateSync(serverToDelete, {
        abortEarly: false,
      });
    } catch {
      toaster.create({
        description: "Deletion of server failed.",
        type: "error",
      });
    }

    if (!validate) return false;

    // Make backend call
    toaster.promise(
      new Promise<void>(async (resolve, reject) => {
        const server = await deleteServer(validate);
        if (!server) reject();
        else {
          // Update servers to remove record if success
          setServers((prev) => {
            return prev.filter(
              (currentServer) => currentServer.id !== server.id
            );
          });
          resolve();
        }
      }),
      {
        success: {
          title: `Deleting ${serverToDelete.applicationName}/${serverToDelete.containerName}`,
          description: "Finished",
        },
        error: {
          title: `Deleting ${serverToDelete.applicationName}/${serverToDelete.containerName}`,
          description: "Failed",
        },
        loading: {
          title: `Deleting ${serverToDelete.applicationName}/${serverToDelete.containerName}`,
          description: "...",
        },
      }
    );

    return true;
  };

  const onServerReboot = async (serverToReboot: Server): Promise<boolean> => {
    // Validate input
    let validate: InferType<typeof rebootServerSchema> | null = null;

    try {
      validate = rebootServerSchema.validateSync(serverToReboot, {
        abortEarly: false,
      });
    } catch {
      toaster.create({
        description: "Reboot of server failed.",
        type: "error",
      });
    }

    if (!validate) return false;

    // Make backend call
    toaster.promise(
      new Promise<void>(async (resolve, reject) => {
        const server = await rebootServer(validate);
        if (!server) reject();
        resolve();
      }),
      {
        success: {
          title: `Rebooting ${serverToReboot.applicationName}/${serverToReboot.containerName}`,
          description: "Finished",
        },
        error: {
          title: `Rebooting ${serverToReboot.applicationName}/${serverToReboot.containerName}`,
          description: "Failed",
        },
        loading: {
          title: `Rebooting ${serverToReboot.applicationName}/${serverToReboot.containerName}`,
          description: "...",
        },
      }
    );

    return true;
  };

  const onServerUpdate = async (serverToUpdate: Server): Promise<boolean> => {
    // Validate input
    let validate: InferType<typeof rebootServerSchema> | null = null;

    try {
      validate = rebootServerSchema.validateSync(serverToUpdate, {
        abortEarly: false,
      });
    } catch {
      toaster.create({
        description: "Update of server failed.",
        type: "error",
      });
    }

    if (!validate) return false;

    // Make backend call
    toaster.promise(
      new Promise<void>(async (resolve, reject) => {
        const server = await updateServer(validate);
        if (!server) reject();
        resolve();
      }),
      {
        success: {
          title: `Updating ${serverToUpdate.applicationName}/${serverToUpdate.containerName}`,
          description: "Finished",
        },
        error: {
          title: `Updating ${serverToUpdate.applicationName}/${serverToUpdate.containerName}`,
          description: "Failed",
        },
        loading: {
          title: `Updating ${serverToUpdate.applicationName}/${serverToUpdate.containerName}`,
          description: "...",
        },
      }
    );

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
