import { Spinner, Stack } from "@chakra-ui/react";
import CRUDTable from "../ui/crud_table";
import { Button } from "../recipes/button";
import { AutoFormDrawer } from "../ui/auto_form_drawer";
import {
  getServers,
  Server,
} from "@/app/utils/server-manager-service/server-manager-service";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function ServerTabContent(props: {
  selectedServer: Server | null;
  setSelectedServer: Dispatch<SetStateAction<Server | null>>;
}) {
  const { selectedServer, setSelectedServer } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [servers, setServers] = useState<Server[]>([]);
  // const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createServerRecord] = useState<Server>({
    id: "",
    applicationName: "",
    containerName: "",
    isInResponseChain: false,
    isUpdatable: true,
  });

  useEffect(() => {
    getServers().then((responseServers) => {
      if (responseServers) setServers(responseServers);
      setIsLoading(false);
    });
  }, []);

  const onServerSelect = (server: Server) => {
    setSelectedServer(server);
  };

  const onServerCreate = () => {
    setIsCreateOpen(true);
    setIsEditOpen(false);
  };

  const onServerEdit = () => {
    setIsCreateOpen(false);
    setIsEditOpen(true);
  };

  return isLoading ? (
    <Spinner
      color="blue"
      size="xl"
      borderWidth="thick"
      marginLeft="45%"
      marginTop="15%"
    />
  ) : (
    <>
      <Stack direction="column">
        <CRUDTable
          records={servers}
          style={{}}
          onRowSelect={onServerSelect}
          idKey="id"
          selectedRecordId={selectedServer?.id}
          onCreate={onServerCreate}
          onEdit={onServerEdit}
        />
        <Stack direction="row" gap={1} marginLeft={2} marginRight={3}>
          <Button variant="safe" disabled={!selectedServer} width="1/2">
            Reboot
          </Button>
          <Button variant="safe" disabled={!selectedServer} width="1/2">
            Update
          </Button>
        </Stack>
      </Stack>
      <AutoFormDrawer<Server>
        record={createServerRecord}
        title={"Create"}
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
      />
      <AutoFormDrawer<Server>
        record={selectedServer}
        title={"Edit"}
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
      />
    </>
  );
}
