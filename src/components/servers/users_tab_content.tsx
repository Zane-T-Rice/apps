import { Skeleton, Stack } from "@chakra-ui/react";
import CRUDTable from "../ui/crud_table";
import {
  useUserServerLinks,
  UserServerLink,
} from "@/app/utils/server-manager-service/server_manager_service_user_server_links";
import { useEffect, useState } from "react";
import { string, object } from "yup";
import { Server } from "@/app/utils/server-manager-service/server_manager_service_servers";
import { Host } from "@/app/utils/server-manager-service/server_manager_service_hosts";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";

const createUserServerLinkSchema = object({
  username: string().required(),
}).stripUnknown();

const deleteUserServerLinkSchema = object({
  id: string().required(),
}).stripUnknown();

export function UserServerLinksTabContent(props: {
  selectedHost: Host;
  selectedServer: Server;
}) {
  const { selectedHost, selectedServer } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userServerLinks, setUserServerLinks] = useState<UserServerLink[]>([]);
  const [selectedUserServerLink, setSelectedUserServerLink] =
    useState<UserServerLink>();
  const [createErrors, setCreateErrors] = useState<{
    [Property in keyof UserServerLink]?: string;
  }>({});

  const [createUserServerLinkRecord] = useState<UserServerLink>({
    id: "",
    username: "",
  });

  const {
    getAllREST: getUserServerLinks,
    createREST: createUserServerLink,
    deleteREST: deleteUserServerLink,
  } = useUserServerLinks(selectedHost, selectedServer);

  useEffect(() => {
    if (!selectedServer) return;

    getUserServerLinks().then((responseUserServerLinks) => {
      if (responseUserServerLinks) setUserServerLinks(responseUserServerLinks);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServer]);

  const onUserServerLinkSelect = (userServerLink: UserServerLink) => {
    setSelectedUserServerLink(userServerLink);
  };

  const {
    onResourceCreate: onUserServerLinkCreate,
    onResourceDelete: onUserServerLinkDelete
  } = useOnCRUD<
    UserServerLink,
    typeof createUserServerLinkSchema,
    typeof createUserServerLinkSchema,
    typeof deleteUserServerLinkSchema
  >({
    resourceNameKey: "username",
    setCreateErrors,
    createResourceSchema: createUserServerLinkSchema,
    deleteResourceSchema: deleteUserServerLinkSchema,
    createResource: createUserServerLink,
    deleteResource: deleteUserServerLink,
    setResources: setUserServerLinks,
    setSelectedResource: setSelectedUserServerLink,
  })

  return isLoading ? (
    <Stack direction="column" marginLeft={2} marginRight={2}>
      <Skeleton height={50} variant="shine" />
      <Skeleton height={250} variant="shine" />
    </Stack>
  ) : (
    <CRUDTable
      records={userServerLinks}
      style={{}}
      idKey="id"
      onRowSelect={onUserServerLinkSelect}
      selectedRecordId={selectedUserServerLink?.id}
      createPermission="server-manager:admin"
      creationRecord={createUserServerLinkRecord}
      onCreate={onUserServerLinkCreate}
      onCreateErrors={createErrors}
      setCreateErrors={setCreateErrors}
      createResourceSchema={createUserServerLinkSchema}
      editPermission="server-manager:admin"
      deletePermission="server-manager:admin"
      onDelete={onUserServerLinkDelete}
      marginLeft={3}
      marginRight={3}
    />
  );
}
