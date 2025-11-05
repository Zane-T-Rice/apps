import { Skeleton, Stack } from "@chakra-ui/react";
import CRUDTable from "../ui/crud_table";
import {
  Port,
  usePorts,
} from "@/app/utils/server-manager-service/server_manager_service_ports";
import { useEffect, useState } from "react";
import { string, object, number } from "yup";
import { Server } from "@/app/utils/server-manager-service/server_manager_service_servers";
import { Host } from "@/app/utils/server-manager-service/server_manager_service_hosts";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";

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

export function PortsTabContent(props: {
  selectedHost: Host;
  selectedServer: Server;
}) {
  const { selectedHost, selectedServer } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ports, setPorts] = useState<Port[]>([]);
  const [selectedPort, setSelectedPort] = useState<Port>();
  const [createPortRecord] = useState<Port>({
    id: "",
    number: 0,
    protocol: "tcp",
  });

  const {
    getAllREST: getPorts,
    createREST: createPort,
    editREST: editPort,
    deleteREST: deletePort,
  } = usePorts(selectedHost, selectedServer);

  useEffect(() => {
    if (!selectedServer) return;

    getPorts().then((responsePorts) => {
      if (responsePorts) setPorts(responsePorts);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServer]);

  const onPortSelect = (port: Port) => {
    setSelectedPort(port);
  };

  const {
    onResourceCreate: onPortCreate,
    onResourceEdit: onPortEdit,
    onResourceDelete: onPortDelete
  } = useOnCRUD<
    Port,
    typeof createPortSchema,
    typeof editPortSchema,
    typeof deletePortSchema
  >({
    resourceNameKey: "number",
    createResourceSchema: createPortSchema,
    editResourceSchema: editPortSchema,
    deleteResourceSchema: deletePortSchema,
    createResource: createPort,
    editResource: editPort,
    deleteResource: deletePort,
    setResources: setPorts,
    setSelectedResource: setSelectedPort,
  })

  return isLoading ? (
    <Stack direction="column" marginLeft={2} marginRight={2}>
      <Skeleton height={50} variant="shine" />
      <Skeleton height={250} variant="shine" />
    </Stack>
  ) : (
    <CRUDTable
      records={ports}
      style={{}}
      idKey="id"
      onRowSelect={onPortSelect}
      selectedRecordId={selectedPort?.id}
      createPermission="server-manager:admin"
      creationRecord={createPortRecord}
      onCreate={onPortCreate}
      createResourceSchema={createPortSchema}
      editPermission="server-manager:admin"
      onEdit={onPortEdit}
      editResourceSchema={editPortSchema}
      deletePermission="server-manager:admin"
      onDelete={onPortDelete}
      marginLeft={3}
      marginRight={3}
    />
  );
}
