import { Skeleton, Stack } from "@chakra-ui/react";
import CRUDTable from "../ui/crud_table";
import {
  Host,
  useHosts,
} from "@/app/utils/server-manager-service/server_manager_service_hosts";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { string, object } from "yup";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";

const createHostSchema = object({
  name: string().required(),
  url: string().required(),
}).stripUnknown();

const editHostSchema = createHostSchema
  .concat(
    object({
      id: string().required(),
    }),
  )
  .stripUnknown();

const deleteHostSchema = object({
  id: string().required(),
}).stripUnknown();

export function HostsTabContent(props: {
  selectedHost?: Host;
  setSelectedHost: Dispatch<SetStateAction<Host | undefined>>;
}) {
  const { selectedHost, setSelectedHost } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hosts, setHosts] = useState<Host[]>([]);

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

  const {
    onResourceCreate: onHostCreate,
    onResourceEdit: onHostEdit,
    onResourceDelete: onHostDelete,
  } = useOnCRUD<
    Host,
    typeof createHostSchema,
    typeof editHostSchema,
    typeof deleteHostSchema
  >({
    resourceNameKey: "name",
    createResourceSchema: createHostSchema,
    editResourceSchema: editHostSchema,
    deleteResourceSchema: deleteHostSchema,
    createResource: createHost,
    editResource: editHost,
    deleteResource: deleteHost,
    setResources: setHosts,
    setSelectedResource: setSelectedHost,
  });

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
        style={{}}
        idKey="id"
        onRowSelect={onHostSelect}
        selectedRecordId={selectedHost?.id}
        createPermission="server-manager:admin"
        creationRecord={createHostRecord}
        onCreate={onHostCreate}
        createResourceSchema={createHostSchema}
        editPermission="server-manager:admin"
        onEdit={onHostEdit}
        editResourceSchema={editHostSchema}
        deletePermission="server-manager:admin"
        onDelete={onHostDelete}
        marginLeft={3}
        marginRight={3}
      />
    </Stack>
  );
}
