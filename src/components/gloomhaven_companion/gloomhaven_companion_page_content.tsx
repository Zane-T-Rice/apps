"use client";

import { Box, Tabs } from "@chakra-ui/react";
import { NavigationBar } from "../ui/navigation_bar";
import { FaServer } from "react-icons/fa";
import { useState } from "react";
import { GloomhavenCompanionTabContent } from "./gloomhaven_companion_tab_content";

export default function GloomhavenCompanionPageContent() {
  const [activeTab, setActiveTab] = useState<string>();

  const actions = <></>;

  const tabTriggers = (
    <>
      <Tabs.Trigger value="campaigns">
        <Box hideBelow="sm">
          <FaServer />
        </Box>
        Campaigns
      </Tabs.Trigger>
    </>
  );

  const tabContents = (
    <>
      <Tabs.Content value="campaigns">
        <GloomhavenCompanionTabContent />
      </Tabs.Content>
    </>
  );

  return (
    <>
      <NavigationBar
        defaultTab="campaigns"
        tabTriggers={tabTriggers}
        tabContents={tabContents}
        actions={actions}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </>
  );
}
