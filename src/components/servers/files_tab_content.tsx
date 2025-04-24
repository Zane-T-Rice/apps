import { Skeleton, Stack } from "@chakra-ui/react";
import CRUDTable from "../ui/crud_table";
import {
  File,
  useFiles,
} from "@/app/utils/server-manager-service/server_manager_service_files";
import { useEffect, useState } from "react";
import { string, object } from "yup";
import { fetchWithValidateAndToast } from "@/app/utils/fetch/fetch_with_validate_and_toast";
import { Server } from "@/app/utils/server-manager-service/server_manager_service_servers";
import { Host } from "@/app/utils/server-manager-service/server_manager_service_hosts";

const createFileSchema = object({
  name: string().required(),
  content: string().required(),
}).stripUnknown();

const editFileSchema = createFileSchema
  .concat(
    object({
      id: string().required(),
    })
  )
  .stripUnknown();

const deleteFileSchema = object({
  id: string().required(),
}).stripUnknown();

export function FilesTabContent(props: {
  selectedHost: Host;
  selectedServer: Server;
}) {
  const { selectedHost, selectedServer } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [createErrors, setCreateErrors] = useState<{
    [Property in keyof File]?: string;
  }>({});
  const [editErrors, setEditErrors] = useState<{
    [Property in keyof File]?: string;
  }>({});

  const [createFileRecord] = useState<File>({
    id: "",
    name: "",
    content: "",
  });

  const {
    getAllREST: getFiles,
    createREST: createFile,
    editREST: editFile,
    deleteREST: deleteFile,
  } = useFiles(selectedHost, selectedServer);

  useEffect(() => {
    if (!selectedServer) return;

    getFiles().then((responseFiles) => {
      if (responseFiles) setFiles(responseFiles);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServer]);

  const onFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const onFileCreate = async (newFile: File): Promise<boolean> => {
    const title = `Creating file ${newFile.name}`;
    const file = await fetchWithValidateAndToast({
      title,
      setErrors: setCreateErrors,
      validateCallback: () => {
        return createFileSchema.validateSync(newFile, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await createFile(validate),
    });
    if (!file) return false;

    // Update files with new record
    setFiles((prev) => {
      return [...prev, file];
    });

    return true;
  };

  const onFileEdit = async (newFile: File): Promise<boolean> => {
    const title = `Editing file ${newFile.name}`;
    const file = await fetchWithValidateAndToast({
      title,
      setErrors: setEditErrors,
      validateCallback: () => {
        return editFileSchema.validateSync(newFile, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await editFile(validate),
    });
    if (!file) return false;

    // Update files with edited record if success
    setFiles((prev) => {
      return prev.map((currentFile) =>
        currentFile.id === file.id ? file : currentFile
      );
    });

    return true;
  };

  const onFileDelete = async (fileToDelete: File): Promise<boolean> => {
    const title = `Deleting file ${fileToDelete.name}`;
    const file = await fetchWithValidateAndToast({
      title,
      setErrors: setEditErrors,
      validateCallback: () => {
        return deleteFileSchema.validateSync(fileToDelete, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await deleteFile(validate),
    });
    if (!file) return false;

    setFiles((prev) => {
      return prev.filter((currentFile) => currentFile.id !== file.id);
    });
    setSelectedFile(null);

    return true;
  };

  return isLoading ? (
    <Stack direction="column" marginLeft={2} marginRight={2}>
      <Skeleton height={50} variant="shine" />
      <Skeleton height={250} variant="shine" />
    </Stack>
  ) : (
    <CRUDTable
      records={files}
      style={{}}
      onRowSelect={onFileSelect}
      idKey="id"
      selectedRecordId={selectedFile?.id}
      onCreate={onFileCreate}
      onCreateErrors={createErrors}
      creationRecord={createFileRecord}
      onEdit={onFileEdit}
      onEditErrors={editErrors}
      onDelete={onFileDelete}
      marginLeft={3}
      marginRight={3}
      createPermission="write:servers"
      editPermission="write:servers"
      deletePermission="write:servers"
    />
  );
}
