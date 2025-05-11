import { Skeleton, Stack } from "@chakra-ui/react";
import CRUDTable from "../ui/crud_table";
import {
  useUserServerLinks,
  UserServerLink,
} from "@/app/utils/server-manager-service/server_manager_service_user_server_links";
import { useEffect, useState } from "react";
import { string, object } from "yup";
import { fetchWithValidateAndToast } from "@/app/utils/fetch/fetch_with_validate_and_toast";
import { Server } from "@/app/utils/server-manager-service/server_manager_service_servers";
import { Host } from "@/app/utils/server-manager-service/server_manager_service_hosts";

const createUserServerLinkSchema = object({
  userId: string().required(),
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
    useState<UserServerLink | null>(null);
  const [createErrors, setCreateErrors] = useState<{
    [Property in keyof UserServerLink]?: string;
  }>({});

  const [createUserServerLinkRecord] = useState<UserServerLink>({
    id: "",
    userId: "",
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

  const onUserServerLinkCreate = async (
    newUserServerLink: UserServerLink
  ): Promise<boolean> => {
    const title = `Connecting ${selectedServer.applicationName}/${selectedServer.containerName} To User ${newUserServerLink.id}`;
    const userServerLink = await fetchWithValidateAndToast({
      title,
      setErrors: setCreateErrors,
      validateCallback: () => {
        return createUserServerLinkSchema.validateSync(newUserServerLink, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await createUserServerLink(validate),
    });
    if (!userServerLink) return false;

    // Update userServerLinks with new record
    setUserServerLinks((prev) => {
      return [...prev, userServerLink];
    });

    return true;
  };

  const onUserServerLinkDelete = async (
    userServerLinkToDelete: UserServerLink
  ): Promise<boolean> => {
    const title = `Disconnecting ${selectedServer.applicationName}/${selectedServer.containerName} From User ${userServerLinkToDelete.id}`;
    const userServerLink = await fetchWithValidateAndToast({
      title,
      validateCallback: () => {
        return deleteUserServerLinkSchema.validateSync(userServerLinkToDelete, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await deleteUserServerLink(validate),
    });
    if (!userServerLink) return false;

    setUserServerLinks((prev) => {
      return prev.filter(
        (currentUserServerLink) =>
          currentUserServerLink.id !== userServerLink.id
      );
    });
    setSelectedUserServerLink(null);

    return true;
  };

  return isLoading ? (
    <Stack direction="column" marginLeft={2} marginRight={2}>
      <Skeleton height={50} variant="shine" />
      <Skeleton height={250} variant="shine" />
    </Stack>
  ) : (
    <CRUDTable
      records={userServerLinks}
      style={{}}
      onRowSelect={onUserServerLinkSelect}
      idKey="id"
      selectedRecordId={selectedUserServerLink?.id}
      onCreate={onUserServerLinkCreate}
      onCreateErrors={createErrors}
      creationRecord={createUserServerLinkRecord}
      onDelete={onUserServerLinkDelete}
      marginLeft={3}
      marginRight={3}
      createPermission="admin:servers"
      deletePermission="admin:servers"
    />
  );
}
