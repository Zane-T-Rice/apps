import { Skeleton, Stack } from "@chakra-ui/react";
import CRUDTable from "../ui/crud_table";
import { EnvironmentVariable } from "@/app/utils/server-manager-service/server_manager_service_environment_variables";
import { useEffect, useState } from "react";
import { string, object } from "yup";
import { Server } from "@/app/utils/server-manager-service/server_manager_service_servers";
import { useEnvironmentVariables } from "@/app/utils/server-manager-service/server_manager_service_environment_variables";
import { Host } from "@/app/utils/server-manager-service/server_manager_service_hosts";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";

const createEnvironmentVariableSchema = object({
  name: string().required(),
  value: string().required(),
}).stripUnknown();

const editEnvironmentVariableSchema = createEnvironmentVariableSchema
  .concat(
    object({
      id: string().required(),
    })
  )
  .stripUnknown();

const deleteEnvironmentVariableSchema = object({
  id: string().required(),
}).stripUnknown();

export function EnvironmentVariablesTabContent(props: {
  selectedHost: Host;
  selectedServer: Server;
}) {
  const { selectedHost, selectedServer } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [environmentVariables, setEnvironmentVariables] = useState<
    EnvironmentVariable[]
  >([]);
  const [selectedEnvironmentVariable, setSelectedEnvironmentVariable] =
    useState<EnvironmentVariable>();

  const [createEnvironmentVariableRecord] = useState<EnvironmentVariable>({
    id: "",
    name: "",
    value: "",
  });

  const {
    getAllREST: getEnvironmentVariables,
    createREST: createEnvironmentVariable,
    editREST: editEnvironmentVariable,
    deleteREST: deleteEnvironmentVariable,
  } = useEnvironmentVariables(selectedHost, selectedServer);

  useEffect(() => {
    if (!selectedServer) return;

    getEnvironmentVariables().then((responseEnvironmentVariables) => {
      if (responseEnvironmentVariables)
        setEnvironmentVariables(responseEnvironmentVariables);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServer]);

  const onEnvironmentVariableSelect = (
    environmentVariable: EnvironmentVariable
  ) => {
    setSelectedEnvironmentVariable(environmentVariable);
  };

  const {
    onResourceCreate: onEnvironmentVariableCreate,
    onResourceEdit: onEnvironmentVariableEdit,
    onResourceDelete: onEnvironmentVariableDelete
  } = useOnCRUD<
    EnvironmentVariable,
    typeof createEnvironmentVariableSchema,
    typeof editEnvironmentVariableSchema,
    typeof deleteEnvironmentVariableSchema
  >({
    resourceNameKey: "name",
    createResourceSchema: createEnvironmentVariableSchema,
    editResourceSchema: editEnvironmentVariableSchema,
    deleteResourceSchema: deleteEnvironmentVariableSchema,
    createResource: createEnvironmentVariable,
    editResource: editEnvironmentVariable,
    deleteResource: deleteEnvironmentVariable,
    setResources: setEnvironmentVariables,
    setSelectedResource: setSelectedEnvironmentVariable,
  })

  return isLoading ? (
    <Stack direction="column" marginLeft={2} marginRight={2}>
      <Skeleton height={50} variant="shine" />
      <Skeleton height={250} variant="shine" />
    </Stack>
  ) : (
    <CRUDTable
      records={environmentVariables}
      style={{}}
      idKey="id"
      onRowSelect={onEnvironmentVariableSelect}
      selectedRecordId={selectedEnvironmentVariable?.id}
      createPermission="server-manager:admin"
      creationRecord={createEnvironmentVariableRecord}
      onCreate={onEnvironmentVariableCreate}
      createResourceSchema={createEnvironmentVariableSchema}
      editPermission="server-manager:admin"
      onEdit={onEnvironmentVariableEdit}
      editResourceSchema={editEnvironmentVariableSchema}
      deletePermission="server-manager:admin"
      onDelete={onEnvironmentVariableDelete}
      marginLeft={3}
      marginRight={3}
    />
  );
}
