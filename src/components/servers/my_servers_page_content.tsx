"use client";

import { Box, Tabs } from "@chakra-ui/react";
import { NavigationBar } from "../ui/navigation_bar";
import { FaServer } from "react-icons/fa";
import { useState } from "react";
import { MyServersTabContent } from "./my_servers_tab_content";

export default function MyServersPageContent() {
  const [activeTab, setActiveTab] = useState<string>();

  const actions = <></>;

  const tabTriggers = (
    <>
      <Tabs.Trigger value="servers">
        <Box hideBelow="sm">
          <FaServer />
        </Box>
        Servers
      </Tabs.Trigger>
    </>
  );

  const tabContents = (
    <>
      <Tabs.Content value="servers">
        <MyServersTabContent />
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
