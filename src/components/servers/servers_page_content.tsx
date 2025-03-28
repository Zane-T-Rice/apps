"use client";

import { Box, Tabs } from "@chakra-ui/react";
import { NavigationBar } from "../ui/navigation_bar";
import { FaServer } from "react-icons/fa";
import { useState } from "react";
import { Server } from "@/app/utils/server-manager-service/server-manager-service-servers";
import { CiEdit } from "react-icons/ci";
import { ServersTabContent } from "./servers_tab_content";
import { PortsTabContent } from "./ports_tab_content";
import { VolumesTabContent } from "./volumes_tab_content";
import { EnvironmentVariablesTabContent } from "./environment_variables_tab_content";
import { FilesTabContent } from "./files_tab_content";

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
        <ServersTabContent
          selectedServer={selectedServer}
          setSelectedServer={setSelectedServer}
        />
      </Tabs.Content>
      <Tabs.Content value="ports">
        {selectedServer ? (
          <PortsTabContent selectedServer={selectedServer} />
        ) : null}
      </Tabs.Content>
      <Tabs.Content value="volumes">
        {selectedServer ? (
          <VolumesTabContent selectedServer={selectedServer} />
        ) : null}
      </Tabs.Content>
      <Tabs.Content value="environment_variables">
        {selectedServer ? (
          <EnvironmentVariablesTabContent selectedServer={selectedServer} />
        ) : null}
      </Tabs.Content>
      <Tabs.Content value="files">
        {selectedServer ? (
          <FilesTabContent selectedServer={selectedServer} />
        ) : null}
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
