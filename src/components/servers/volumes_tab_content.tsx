import { Skeleton, Stack } from "@chakra-ui/react";
import CRUDTable from "../ui/crud_table";
import {
  createVolume,
  deleteVolume,
  editVolume,
  getVolumes,
  Volume,
} from "@/app/utils/server-manager-service/server-manager-service-volumes";
import { useEffect, useState } from "react";
import { string, object } from "yup";
import { fetchWithValidateAndToast } from "@/app/utils/fetch/fetch_with_validate_and_toast";
import { Server } from "@/app/utils/server-manager-service/server-manager-service-servers";

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

export function VolumesTabContent(props: { selectedServer: Server }) {
  const { selectedServer } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [selectedVolume, setSelectedVolume] = useState<Volume | null>(null);
  const [createErrors, setCreateErrors] = useState<{
    [Property in keyof Volume]?: string;
  }>({});
  const [editErrors, setEditErrors] = useState<{
    [Property in keyof Volume]?: string;
  }>({});

  const [createVolumeRecord] = useState<Volume>({
    id: "",
    hostPath: "",
    containerPath: "",
  });

  useEffect(() => {
    if (!selectedServer) return;

    getVolumes(selectedServer).then((responseVolumes) => {
      if (responseVolumes) setVolumes(responseVolumes);
      setIsLoading(false);
    });
  }, [selectedServer]);

  const onVolumeSelect = (volume: Volume) => {
    setSelectedVolume(volume);
  };

  const onVolumeCreate = async (newVolume: Volume): Promise<boolean> => {
    const title = `Creating volume ${newVolume.hostPath}:${newVolume.containerPath}`;
    const volume = await fetchWithValidateAndToast({
      title,
      setErrors: setCreateErrors,
      validateCallback: () => {
        return createVolumeSchema.validateSync(newVolume, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) =>
        await createVolume(selectedServer, validate),
    });
    if (!volume) return false;

    // Update volumes with new record
    setVolumes((prev) => {
      return [...prev, volume];
    });

    return true;
  };

  const onVolumeEdit = async (newVolume: Volume): Promise<boolean> => {
    const title = `Editing volume ${newVolume.hostPath}:${newVolume.containerPath}`;
    const volume = await fetchWithValidateAndToast({
      title,
      setErrors: setEditErrors,
      validateCallback: () => {
        return editVolumeSchema.validateSync(newVolume, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) =>
        await editVolume(selectedServer, validate),
    });
    if (!volume) return false;

    // Update volumes with edited record if success
    setVolumes((prev) => {
      return prev.map((currentVolume) =>
        currentVolume.id === volume.id ? volume : currentVolume
      );
    });

    return true;
  };

  const onVolumeDelete = async (volumeToDelete: Volume): Promise<boolean> => {
    const title = `Deleting volume ${volumeToDelete.hostPath}:${volumeToDelete.containerPath}`;
    const volume = await fetchWithValidateAndToast({
      title,
      setErrors: setEditErrors,
      validateCallback: () => {
        return deleteVolumeSchema.validateSync(volumeToDelete, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) =>
        await deleteVolume(selectedServer, validate),
    });
    if (!volume) return false;

    setVolumes((prev) => {
      return prev.filter((currentVolume) => currentVolume.id !== volume.id);
    });
    setSelectedVolume(null);

    return true;
  };

  return isLoading ? (
    <Stack direction="column" marginLeft={2} marginRight={2}>
      <Skeleton height={50} variant="shine" />
      <Skeleton height={250} variant="shine" />
    </Stack>
  ) : (
    <CRUDTable
      records={volumes}
      style={{}}
      onRowSelect={onVolumeSelect}
      idKey="id"
      selectedRecordId={selectedVolume?.id}
      onCreate={onVolumeCreate}
      onCreateErrors={createErrors}
      creationRecord={createVolumeRecord}
      onEdit={onVolumeEdit}
      onEditErrors={editErrors}
      onDelete={onVolumeDelete}
      marginLeft={3}
      marginRight={3}
    />
  );
}
