import { Skeleton, Stack } from "@chakra-ui/react";
import CRUDTable from "../ui/crud_table";
import {
  File,
  useFiles,
} from "@/app/utils/server-manager-service/server_manager_service_files";
import { useEffect, useState } from "react";
import { string, object } from "yup";
import { Server } from "@/app/utils/server-manager-service/server_manager_service_servers";
import { Host } from "@/app/utils/server-manager-service/server_manager_service_hosts";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";

const createFileSchema = object({
  name: string().required(),
  content: string().required(),
}).stripUnknown();

const editFileSchema = createFileSchema
  .concat(
    object({
      id: string().required(),
    }),
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
  const [selectedFile, setSelectedFile] = useState<File>();

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

  const {
    onResourceCreate: onFileCreate,
    onResourceEdit: onFileEdit,
    onResourceDelete: onFileDelete,
  } = useOnCRUD<
    File,
    typeof createFileSchema,
    typeof editFileSchema,
    typeof deleteFileSchema
  >({
    resourceNameKey: "name",
    createResourceSchema: createFileSchema,
    editResourceSchema: editFileSchema,
    deleteResourceSchema: deleteFileSchema,
    createResource: createFile,
    editResource: editFile,
    deleteResource: deleteFile,
    setResources: setFiles,
    setSelectedResource: setSelectedFile,
  });

  return isLoading ? (
    <Stack direction="column" marginLeft={2} marginRight={2}>
      <Skeleton height={50} variant="shine" />
      <Skeleton height={250} variant="shine" />
    </Stack>
  ) : (
    <CRUDTable
      records={files}
      style={{}}
      idKey="id"
      onRowSelect={onFileSelect}
      selectedRecordId={selectedFile?.id}
      createPermission="server-manager:admin"
      creationRecord={createFileRecord}
      onCreate={onFileCreate}
      createResourceSchema={createFileSchema}
      editPermission="server-manager:admin"
      onEdit={onFileEdit}
      editResourceSchema={editFileSchema}
      deletePermission="server-manager:admin"
      onDelete={onFileDelete}
      marginLeft={3}
      marginRight={3}
    />
  );
}
