"use client";

import { Box, Tabs, Text } from "@chakra-ui/react";
import { NavigationBar } from "../ui/navigation_bar";
import { FaServer } from "react-icons/fa";
import { useState } from "react";
import { Server } from "@/app/utils/server-manager-service/server-manager-service";
import { CiEdit } from "react-icons/ci";
import { ServerTabContent } from "./server_tab_content";

export default function ServersPageContent() {
  const [activeTab, setActiveTab] = useState<string>("servers");
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

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
      <Tabs.Content value="servers">
        <ServerTabContent
          selectedServer={selectedServer}
          setSelectedServer={setSelectedServer}
        />
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
  );

  return (
    <>
      <NavigationBar
        defaultTab="servers"
        tabTriggers={tabTriggers}
        tabContents={tabContents}
        actions={actions}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </>
  );
}
