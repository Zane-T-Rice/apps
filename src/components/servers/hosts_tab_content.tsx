import { Skeleton, Stack } from "@chakra-ui/react";
import CRUDTable from "../ui/crud_table";
import {
  Host,
  useHosts,
} from "@/app/utils/server-manager-service/server_manager_service_hosts";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { string, object } from "yup";
import { fetchWithValidateAndToast } from "@/app/utils/fetch/fetch_with_validate_and_toast";

const createHostSchema = object({
  name: string().required(),
  url: string().required(),
}).stripUnknown();

const editHostSchema = createHostSchema
  .concat(
    object({
      id: string().required(),
    })
  )
  .stripUnknown();

const deleteHostSchema = object({
  id: string().required(),
}).stripUnknown();

export function HostsTabContent(props: {
  selectedHost: Host | null;
  setSelectedHost: Dispatch<SetStateAction<Host | null>>;
}) {
  const { selectedHost, setSelectedHost } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [createErrors, setCreateErrors] = useState<{
    [Property in keyof Host]?: string;
  }>({});
  const [editErrors, setEditErrors] = useState<{
    [Property in keyof Host]?: string;
  }>({});

  const [createHostRecord] = useState<Host>({
    id: "",
    name: "",
    url: "",
  });

  const {
    getAllREST: getHosts,
    createREST: createHost,
    editREST: editHost,
    deleteREST: deleteHost,
  } = useHosts();

  useEffect(() => {
    getHosts().then((responseHosts) => {
      if (responseHosts) setHosts(responseHosts);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onHostSelect = (server: Host) => {
    setSelectedHost(server);
  };

  const onHostCreate = async (newHost: Host): Promise<boolean> => {
    const title = `Creating host ${newHost.name}`;
    const host = await fetchWithValidateAndToast({
      title,
      setErrors: setCreateErrors,
      validateCallback: () => {
        return createHostSchema.validateSync(newHost, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await createHost(validate),
    });
    if (!host) return false;

    // Update hosts with new record
    setHosts((prev) => {
      return [...prev, host];
    });

    return true;
  };

  const onHostEdit = async (newHost: Host): Promise<boolean> => {
    const title = `Editing host ${newHost.name}`;
    const host = await fetchWithValidateAndToast({
      title,
      setErrors: setEditErrors,
      validateCallback: () => {
        return editHostSchema.validateSync(newHost, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await editHost(validate),
    });
    if (!host) return false;

    // Update hosts with edited record if success
    setHosts((prev) => {
      return prev.map((currentHost) =>
        currentHost.id === host.id ? host : currentHost
      );
    });

    return true;
  };

  const onHostDelete = async (serverToDelete: Host): Promise<boolean> => {
    const title = `Deleting host ${serverToDelete.name}`;
    const host = await fetchWithValidateAndToast({
      title,
      setErrors: setEditErrors,
      validateCallback: () => {
        return deleteHostSchema.validateSync(serverToDelete, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await deleteHost(validate),
    });
    if (!host) return false;

    setHosts((prev) => {
      return prev.filter((currentHost) => currentHost.id !== host.id);
    });
    setSelectedHost(null);

    return true;
  };

  return isLoading ? (
    <Stack direction="column" marginLeft={2} marginRight={2}>
      <Skeleton height={50} variant="shine" />
      <Skeleton height={250} variant="shine" />
      <Skeleton height={50} variant="shine" />
    </Stack>
  ) : (
    <Stack direction="column">
      <CRUDTable
        records={hosts}
        onRowSelect={onHostSelect}
        idKey="id"
        selectedRecordId={selectedHost?.id}
        onCreate={onHostCreate}
        onCreateErrors={createErrors}
        creationRecord={createHostRecord}
        onEdit={onHostEdit}
        onEditErrors={editErrors}
        onDelete={onHostDelete}
        marginLeft={3}
        marginRight={3}
        createPermission="write:servers"
        editPermission="write:servers"
        deletePermission="write:servers"
      />
    </Stack>
  );
}
