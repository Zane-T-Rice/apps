"use client";

import { Box, Spinner, Stack, Tabs, Text } from "@chakra-ui/react";
import { NavigationBar } from "../ui/navigation_bar";
import { FaServer } from "react-icons/fa";
import { useEffect, useState } from "react";
import {
  getServers,
  Server,
} from "@/app/utils/server-manager-service/server-manager-service";
import { CiEdit } from "react-icons/ci";
import { Button } from "../recipes/button";
import CRUDTable from "../ui/crud_table";

export default function ServersPageContent() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [servers, setServers] = useState<Server[]>([]);
  const [activeTab, setActiveTab] = useState<string>("servers");
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

  useEffect(() => {
    getServers().then((responseServers) => {
      if (responseServers) setServers(responseServers);
      setIsLoading(false);
    });
  }, []);

  const onServerSelect = (server: Server) => {
    setSelectedServer(server);
  };

  // Eventually this will be buttons to add a server.
  const actions = <></>;

  const tabTriggers = (
    <>
      <Tabs.Trigger value="servers">
        <Box hideBelow="sm">
          <FaServer />
        </Box>
        Servers
      </Tabs.Trigger>
      <Tabs.Trigger value="ports" disabled={!selectedServer}>
        <Box hideBelow="sm">
          <CiEdit />
        </Box>
        Ports
      </Tabs.Trigger>
      <Tabs.Trigger value="volumes" disabled={!selectedServer}>
        <Box hideBelow="sm">
          <CiEdit />
        </Box>
        Volumes
      </Tabs.Trigger>
      <Tabs.Trigger value="environment_variables" disabled={!selectedServer}>
        <Box hideBelow="sm">
          <CiEdit />
        </Box>
        Env Variables
      </Tabs.Trigger>
      <Tabs.Trigger value="files" disabled={!selectedServer}>
        <Box hideBelow="sm">
          <CiEdit />
        </Box>
        Files
      </Tabs.Trigger>
    </>
  );

  const tabContents = (
    <>
      {isLoading ? (
        <Spinner
          color="blue"
          size="xl"
          borderWidth="thick"
          marginLeft="45%"
          marginTop="15%"
        />
      ) : (
        <>
          <Tabs.Content value="servers">
            <Stack direction="column">
              <CRUDTable
                records={servers}
                style={{}}
                onRowSelect={onServerSelect}
                idKey="id"
                selectedRecordId={selectedServer?.id}
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
          </Tabs.Content>
          <Tabs.Content value="ports">
            {selectedServer ? <Text>{selectedServer.id}</Text> : null}
          </Tabs.Content>
          <Tabs.Content value="volumes">
            {selectedServer ? <Text>{selectedServer.id}</Text> : null}
          </Tabs.Content>
          <Tabs.Content value="environment_variables">
            {selectedServer ? <Text>{selectedServer.id}</Text> : null}
          </Tabs.Content>
          <Tabs.Content value="files">
            {selectedServer ? <Text>{selectedServer.id}</Text> : null}
          </Tabs.Content>
        </>
      )}
    </>
  );

  return (
    <NavigationBar
      defaultTab="servers"
      tabTriggers={tabTriggers}
      tabContents={tabContents}
      actions={actions}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
}
