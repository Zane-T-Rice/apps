import { Skeleton, Stack } from "@chakra-ui/react";
import CRUDTable from "../ui/crud_table";
import {
  createEnvironmentVariable,
  deleteEnvironmentVariable,
  editEnvironmentVariable,
  getEnvironmentVariables,
  EnvironmentVariable,
} from "@/app/utils/server-manager-service/server-manager-service-environment-variables";
import { useEffect, useState } from "react";
import { string, object } from "yup";
import { fetchWithValidateAndToast } from "@/app/utils/fetch/fetch_with_validate_and_toast";
import { Server } from "@/app/utils/server-manager-service/server-manager-service-servers";

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
  selectedServer: Server;
}) {
  const { selectedServer } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [environmentVariables, setEnvironmentVariables] = useState<
    EnvironmentVariable[]
  >([]);
  const [selectedEnvironmentVariable, setSelectedEnvironmentVariable] =
    useState<EnvironmentVariable | null>(null);
  const [createErrors, setCreateErrors] = useState<{
    [Property in keyof EnvironmentVariable]?: string;
  }>({});
  const [editErrors, setEditErrors] = useState<{
    [Property in keyof EnvironmentVariable]?: string;
  }>({});

  const [createEnvironmentVariableRecord] = useState<EnvironmentVariable>({
    id: "",
    name: "",
    value: "",
  });

  useEffect(() => {
    if (!selectedServer) return;

    getEnvironmentVariables(selectedServer).then(
      (responseEnvironmentVariables) => {
        if (responseEnvironmentVariables)
          setEnvironmentVariables(responseEnvironmentVariables);
        setIsLoading(false);
      }
    );
  }, [selectedServer]);

  const onEnvironmentVariableSelect = (
    environmentVariable: EnvironmentVariable
  ) => {
    setSelectedEnvironmentVariable(environmentVariable);
  };

  const onEnvironmentVariableCreate = async (
    newEnvironmentVariable: EnvironmentVariable
  ): Promise<boolean> => {
    const title = `Creating environment variable ${newEnvironmentVariable.name}:${newEnvironmentVariable.value}`;
    const environmentVariable = await fetchWithValidateAndToast({
      title,
      setErrors: setCreateErrors,
      validateCallback: () => {
        return createEnvironmentVariableSchema.validateSync(
          newEnvironmentVariable,
          {
            abortEarly: false,
          }
        );
      },
      fetchCallback: async (validate) =>
        await createEnvironmentVariable(selectedServer, validate),
    });
    if (!environmentVariable) return false;

    // Update environmentVariables with new record
    setEnvironmentVariables((prev) => {
      return [...prev, environmentVariable];
    });

    return true;
  };

  const onEnvironmentVariableEdit = async (
    newEnvironmentVariable: EnvironmentVariable
  ): Promise<boolean> => {
    const title = `Editing environment variable ${newEnvironmentVariable.name}:${newEnvironmentVariable.value}`;
    const environmentVariable = await fetchWithValidateAndToast({
      title,
      setErrors: setEditErrors,
      validateCallback: () => {
        return editEnvironmentVariableSchema.validateSync(
          newEnvironmentVariable,
          {
            abortEarly: false,
          }
        );
      },
      fetchCallback: async (validate) =>
        await editEnvironmentVariable(selectedServer, validate),
    });
    if (!environmentVariable) return false;

    // Update environmentVariables with edited record if success
    setEnvironmentVariables((prev) => {
      return prev.map((currentEnvironmentVariable) =>
        currentEnvironmentVariable.id === environmentVariable.id
          ? environmentVariable
          : currentEnvironmentVariable
      );
    });

    return true;
  };

  const onEnvironmentVariableDelete = async (
    environmentVariableToDelete: EnvironmentVariable
  ): Promise<boolean> => {
    const title = `Deleting environment variable ${environmentVariableToDelete.name}:${environmentVariableToDelete.value}`;
    const environmentVariable = await fetchWithValidateAndToast({
      title,
      setErrors: setEditErrors,
      validateCallback: () => {
        return deleteEnvironmentVariableSchema.validateSync(
          environmentVariableToDelete,
          {
            abortEarly: false,
          }
        );
      },
      fetchCallback: async (validate) =>
        await deleteEnvironmentVariable(selectedServer, validate),
    });
    if (!environmentVariable) return false;

    setEnvironmentVariables((prev) => {
      return prev.filter(
        (currentEnvironmentVariable) =>
          currentEnvironmentVariable.id !== environmentVariable.id
      );
    });
    setSelectedEnvironmentVariable(null);

    return true;
  };

  return isLoading ? (
    <Stack direction="column" marginLeft={2} marginRight={2}>
      <Skeleton height={50} variant="shine" />
      <Skeleton height={250} variant="shine" />
    </Stack>
  ) : (
    <CRUDTable
      records={environmentVariables}
      style={{}}
      onRowSelect={onEnvironmentVariableSelect}
      idKey="id"
      selectedRecordId={selectedEnvironmentVariable?.id}
      onCreate={onEnvironmentVariableCreate}
      onCreateErrors={createErrors}
      creationRecord={createEnvironmentVariableRecord}
      onEdit={onEnvironmentVariableEdit}
      onEditErrors={editErrors}
      onDelete={onEnvironmentVariableDelete}
    />
  );
}
