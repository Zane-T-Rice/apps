import { Skeleton, Stack } from "@chakra-ui/react";
import CRUDTable from "../ui/crud_table";
import {
  createPort,
  deletePort,
  editPort,
  getPorts,
  Port,
} from "@/app/utils/server-manager-service/server-manager-service-ports";
import { useEffect, useState } from "react";
import { string, object, number } from "yup";
import { fetchWithValidateAndToast } from "@/app/utils/fetch/fetch_with_validate_and_toast";
import { Server } from "@/app/utils/server-manager-service/server-manager-service-servers";

const createPortSchema = object({
  number: number().required(),
  protocol: string().required(),
}).stripUnknown();

const editPortSchema = createPortSchema
  .concat(
    object({
      id: string().required(),
    })
  )
  .stripUnknown();

const deletePortSchema = object({
  id: string().required(),
}).stripUnknown();

export function PortsTabContent(props: { selectedServer: Server }) {
  const { selectedServer } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ports, setPorts] = useState<Port[]>([]);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [createErrors, setCreateErrors] = useState<{
    [Property in keyof Port]?: string;
  }>({});
  const [editErrors, setEditErrors] = useState<{
    [Property in keyof Port]?: string;
  }>({});

  const [createPortRecord] = useState<Port>({
    id: "",
    number: 0,
    protocol: "tcp",
  });

  useEffect(() => {
    if (!selectedServer) return;

    getPorts(selectedServer).then((responsePorts) => {
      if (responsePorts) setPorts(responsePorts);
      setIsLoading(false);
    });
  }, [selectedServer]);

  const onPortSelect = (port: Port) => {
    setSelectedPort(port);
  };

  const onPortCreate = async (newPort: Port): Promise<boolean> => {
    const title = `Creating port ${newPort.number}/${newPort.protocol}`;
    const port = await fetchWithValidateAndToast({
      title,
      setErrors: setCreateErrors,
      validateCallback: () => {
        return createPortSchema.validateSync(newPort, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) =>
        await createPort(selectedServer, validate),
    });
    if (!port) return false;

    // Update ports with new record
    setPorts((prev) => {
      return [...prev, port];
    });

    return true;
  };

  const onPortEdit = async (newPort: Port): Promise<boolean> => {
    const title = `Editing port ${newPort.number}/${newPort.protocol}`;
    const port = await fetchWithValidateAndToast({
      title,
      setErrors: setEditErrors,
      validateCallback: () => {
        return editPortSchema.validateSync(newPort, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) =>
        await editPort(selectedServer, validate),
    });
    if (!port) return false;

    // Update ports with edited record if success
    setPorts((prev) => {
      return prev.map((currentPort) =>
        currentPort.id === port.id ? port : currentPort
      );
    });

    return true;
  };

  const onPortDelete = async (portToDelete: Port): Promise<boolean> => {
    const title = `Deleting port ${portToDelete.number}/${portToDelete.protocol}`;
    const port = await fetchWithValidateAndToast({
      title,
      setErrors: setEditErrors,
      validateCallback: () => {
        return deletePortSchema.validateSync(portToDelete, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) =>
        await deletePort(selectedServer, validate),
    });
    if (!port) return false;

    setPorts((prev) => {
      return prev.filter((currentPort) => currentPort.id !== port.id);
    });
    setSelectedPort(null);

    return true;
  };

  return isLoading ? (
    <Stack direction="column" marginLeft={2} marginRight={2}>
      <Skeleton height={50} variant="shine" />
      <Skeleton height={250} variant="shine" />
    </Stack>
  ) : (
    <CRUDTable
      records={ports}
      style={{}}
      onRowSelect={onPortSelect}
      idKey="id"
      selectedRecordId={selectedPort?.id}
      onCreate={onPortCreate}
      onCreateErrors={createErrors}
      creationRecord={createPortRecord}
      onEdit={onPortEdit}
      onEditErrors={editErrors}
      onDelete={onPortDelete}
    />
  );
}
