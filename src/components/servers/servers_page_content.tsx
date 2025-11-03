"use client";

import { Box, Tabs } from "@chakra-ui/react";
import { NavigationBar } from "../ui/navigation_bar";
import { FaGhost, FaServer } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Server } from "@/app/utils/server-manager-service/server_manager_service_servers";
import { CiEdit } from "react-icons/ci";
import { ServersTabContent } from "./servers_tab_content";
import { PortsTabContent } from "./ports_tab_content";
import { VolumesTabContent } from "./volumes_tab_content";
import { EnvironmentVariablesTabContent } from "./environment_variables_tab_content";
import { FilesTabContent } from "./files_tab_content";
import { Host } from "@/app/utils/server-manager-service/server_manager_service_hosts";
import { HostsTabContent } from "./hosts_tab_content";
import { UserServerLinksTabContent } from "./users_tab_content";

export default function ServersPageContent() {
  const [activeTab, setActiveTab] = useState<string>();
  const [selectedHost, setSelectedHost] = useState<Host>();
  const [selectedServer, setSelectedServer] = useState<Server>();

  useEffect(() => {
    setSelectedServer(undefined);
  }, [selectedHost]);

  const actions = <></>;

  const tabTriggers = (
    <>
      <Tabs.Trigger value="hosts">
        <Box hideBelow="sm">
          <FaGhost />
        </Box>
        Hosts
      </Tabs.Trigger>
      <Tabs.Trigger value="servers" disabled={!selectedHost}>
        <Box hideBelow="sm">
          <FaServer />
        </Box>
        Servers
      </Tabs.Trigger>
      <Tabs.Trigger value="ports" disabled={!selectedHost || !selectedServer}>
        <Box hideBelow="sm">
          <CiEdit />
        </Box>
        Ports
      </Tabs.Trigger>
      <Tabs.Trigger value="volumes" disabled={!selectedHost || !selectedServer}>
        <Box hideBelow="sm">
          <CiEdit />
        </Box>
        Volumes
      </Tabs.Trigger>
      <Tabs.Trigger
        value="environment_variables"
        disabled={!selectedHost || !selectedServer}
      >
        <Box hideBelow="sm">
          <CiEdit />
        </Box>
        Env Variables
      </Tabs.Trigger>
      <Tabs.Trigger value="files" disabled={!selectedHost || !selectedServer}>
        <Box hideBelow="sm">
          <CiEdit />
        </Box>
        Files
      </Tabs.Trigger>
      <Tabs.Trigger value="users" disabled={!selectedHost || !selectedServer}>
        <Box hideBelow="sm">
          <CiEdit />
        </Box>
        Users
      </Tabs.Trigger>
    </>
  );

  const tabContents = (
    <>
      <Tabs.Content value="hosts">
        <HostsTabContent
          selectedHost={selectedHost}
          setSelectedHost={setSelectedHost}
        />
      </Tabs.Content>
      <Tabs.Content value="servers">
        {selectedHost ? (
          <ServersTabContent
            selectedHost={selectedHost}
            selectedServer={selectedServer}
            setSelectedServer={setSelectedServer}
          />
        ) : null}
      </Tabs.Content>
      <Tabs.Content value="ports">
        {selectedHost && selectedServer ? (
          <PortsTabContent
            selectedHost={selectedHost}
            selectedServer={selectedServer}
          />
        ) : null}
      </Tabs.Content>
      <Tabs.Content value="volumes">
        {selectedHost && selectedServer ? (
          <VolumesTabContent
            selectedHost={selectedHost}
            selectedServer={selectedServer}
          />
        ) : null}
      </Tabs.Content>
      <Tabs.Content value="environment_variables">
        {selectedHost && selectedServer ? (
          <EnvironmentVariablesTabContent
            selectedHost={selectedHost}
            selectedServer={selectedServer}
          />
        ) : null}
      </Tabs.Content>
      <Tabs.Content value="files">
        {selectedHost && selectedServer ? (
          <FilesTabContent
            selectedHost={selectedHost}
            selectedServer={selectedServer}
          />
        ) : null}
      </Tabs.Content>
      <Tabs.Content value="users">
        {selectedHost && selectedServer ? (
          <UserServerLinksTabContent
            selectedHost={selectedHost}
            selectedServer={selectedServer}
          />
        ) : null}
      </Tabs.Content>
    </>
  );

  return (
    <>
      <NavigationBar
        defaultTab="hosts"
        tabTriggers={tabTriggers}
        tabContents={tabContents}
        actions={actions}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </>
  );
}
