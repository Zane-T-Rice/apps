import { Skeleton, Stack } from "@chakra-ui/react";
import CRUDTable from "../ui/crud_table";
import {
  useVolumes,
  Volume,
} from "@/app/utils/server-manager-service/server_manager_service_volumes";
import { useEffect, useState } from "react";
import { string, object } from "yup";
import { Server } from "@/app/utils/server-manager-service/server_manager_service_servers";
import { Host } from "@/app/utils/server-manager-service/server_manager_service_hosts";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";

const createVolumeSchema = object({
  hostPath: string().required(),
  containerPath: string().required(),
}).stripUnknown();

const editVolumeSchema = createVolumeSchema
  .concat(
    object({
      id: string().required(),
    })
  )
  .stripUnknown();

const deleteVolumeSchema = object({
  id: string().required(),
}).stripUnknown();

export function VolumesTabContent(props: {
  selectedHost: Host;
  selectedServer: Server;
}) {
  const { selectedHost, selectedServer } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [selectedVolume, setSelectedVolume] = useState<Volume>();

  const [createVolumeRecord] = useState<Volume>({
    id: "",
    hostPath: "",
    containerPath: "",
  });

  const {
    getAllREST: getVolumes,
    createREST: createVolume,
    editREST: editVolume,
    deleteREST: deleteVolume,
  } = useVolumes(selectedHost, selectedServer);

  useEffect(() => {
    if (!selectedServer) return;

    getVolumes().then((responseVolumes) => {
      if (responseVolumes) setVolumes(responseVolumes);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServer]);

  const onVolumeSelect = (volume: Volume) => {
    setSelectedVolume(volume);
  };

  const {
    onResourceCreate: onVolumeCreate,
    onResourceEdit: onVolumeEdit,
    onResourceDelete: onVolumeDelete
  } = useOnCRUD<
    Volume,
    typeof createVolumeSchema,
    typeof editVolumeSchema,
    typeof deleteVolumeSchema
  >({
    resourceNameKey: "containerPath",
    createResourceSchema: createVolumeSchema,
    editResourceSchema: editVolumeSchema,
    deleteResourceSchema: deleteVolumeSchema,
    createResource: createVolume,
    editResource: editVolume,
    deleteResource: deleteVolume,
    setResources: setVolumes,
    setSelectedResource: setSelectedVolume,
  })

  return isLoading ? (
    <Stack direction="column" marginLeft={2} marginRight={2}>
      <Skeleton height={50} variant="shine" />
      <Skeleton height={250} variant="shine" />
    </Stack>
  ) : (
    <CRUDTable
      records={volumes}
      style={{}}
      idKey="id"
      onRowSelect={onVolumeSelect}
      selectedRecordId={selectedVolume?.id}
      createPermission="server-manager:admin"
      creationRecord={createVolumeRecord}
      onCreate={onVolumeCreate}
      createResourceSchema={createVolumeSchema}
      editPermission="server-manager:admin"
      onEdit={onVolumeEdit}
      editResourceSchema={editVolumeSchema}
      deletePermission="server-manager:admin"
      onDelete={onVolumeDelete}
      marginLeft={3}
      marginRight={3}
    />
  );
}
