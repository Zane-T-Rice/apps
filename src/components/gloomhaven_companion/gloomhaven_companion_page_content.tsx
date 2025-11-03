"use client";

import { Box, Tabs } from "@chakra-ui/react";
import { NavigationBar } from "../ui/navigation_bar";
import { FaServer } from "react-icons/fa";
import { useState } from "react";
import { GloomhavenCompanionCampaignTabContent } from "./gloomhaven_companion_campaign_tab_content";
import { GloomhavenCompanionScenarioTabContent } from "./gloomhaven_companion_scenario_tab_content";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";

export default function GloomhavenCompanionPageContent() {
  const [activeTab, setActiveTab] = useState<string>();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();

  const actions = <></>;

  const tabTriggers = (
    <>
      <Tabs.Trigger value="campaigns">
        <Box hideBelow="sm">
          <FaServer />
        </Box>
        Campaigns
      </Tabs.Trigger>
      <Tabs.Trigger value="scenarios" disabled={!selectedCampaign}>
        <Box hideBelow="sm">
          <FaServer />
        </Box>
        Scenarios
      </Tabs.Trigger>
    </>
  );

  const tabContents = (
    <>
      <Tabs.Content value="campaigns">
        <GloomhavenCompanionCampaignTabContent selectedCampaign={selectedCampaign} setSelectedCampaign={setSelectedCampaign} />
      </Tabs.Content>
      {selectedCampaign && <Tabs.Content value="scenarios">
        <GloomhavenCompanionScenarioTabContent campaign={selectedCampaign} />
      </Tabs.Content>
      }
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
