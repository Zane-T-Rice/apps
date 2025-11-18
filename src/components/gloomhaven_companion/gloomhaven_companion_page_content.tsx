"use client";

import { Box, Tabs } from "@chakra-ui/react";
import { NavigationBar } from "../ui/navigation_bar";
import { FaCity } from "react-icons/fa";
import { useEffect, useState } from "react";
import { GloomhavenCompanionCampaignTabContent } from "./gloomhaven_companion_campaign_tab_content";
import { GloomhavenCompanionScenarioTabContent } from "./gloomhaven_companion_scenario_tab_content";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { GloomhavenCompanionFigureTabContent } from "./gloomhaven_companion_figure_tab_content";
import { GiMeepleGroup } from "react-icons/gi";
import { FiHexagon } from "react-icons/fi";
import { useSearchParams } from "next/navigation";
import { useQueryString } from "@/app/utils/use_clear_query_string";

export default function GloomhavenCompanionPageContent() {
  const searchParams = useSearchParams();
  const { setQueryString } = useQueryString();
  const [activeTab, setActiveTab] = useState<string>();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();
  const [selectedScenario, setSelectedScenario] = useState<Scenario>();

  const onCampaignSelect = (campaign: Campaign) => {
    if (selectedCampaign?.entity === campaign.entity) return;
    setSelectedCampaign(campaign);
    setSelectedScenario(undefined);
  };

  useEffect(() => {
    const moveToFigures = async () => {
      if (
        searchParams.get("campaignId") &&
        selectedCampaign &&
        !selectedScenario
      ) {
        setActiveTab("scenarios");
      }

      if (
        searchParams.get("campaignId") &&
        searchParams.get("scenarioId") &&
        selectedCampaign &&
        selectedScenario
      ) {
        setActiveTab("figures");
      }
    };

    moveToFigures();
  }, [selectedCampaign, selectedScenario, searchParams]);

  const actions = <></>;

  const tabTriggers = (
    <>
      <Tabs.Trigger
        value="campaigns"
        onClick={() => setQueryString(undefined, undefined)}
      >
        <Box hideBelow="sm">
          <FaCity />
        </Box>
        Campaigns
      </Tabs.Trigger>
      <Tabs.Trigger
        value="scenarios"
        onClick={() => setQueryString(selectedCampaign?.id, undefined)}
        disabled={!selectedCampaign}
      >
        <Box hideBelow="sm">
          <FiHexagon />
        </Box>
        Scenarios
      </Tabs.Trigger>
      <Tabs.Trigger
        value="figures"
        onClick={() =>
          setQueryString(selectedCampaign?.id, selectedScenario?.id)
        }
        disabled={!selectedCampaign || !selectedScenario}
      >
        <Box hideBelow="sm">
          <GiMeepleGroup />
        </Box>
        Figures
      </Tabs.Trigger>
    </>
  );

  const tabContents = (
    <>
      <Tabs.Content value="campaigns">
        <GloomhavenCompanionCampaignTabContent
          selectedCampaign={selectedCampaign}
          setSelectedCampaign={setSelectedCampaign}
          onCampaignSelect={onCampaignSelect}
        />
      </Tabs.Content>
      {selectedCampaign && (
        <Tabs.Content value="scenarios">
          <GloomhavenCompanionScenarioTabContent
            selectedCampaign={selectedCampaign}
            selectedScenario={selectedScenario}
            setSelectedScenario={setSelectedScenario}
          />
        </Tabs.Content>
      )}
      {selectedCampaign && selectedScenario && (
        <Tabs.Content value="figures">
          <GloomhavenCompanionFigureTabContent
            selectedCampaign={selectedCampaign}
            selectedScenario={selectedScenario}
          />
        </Tabs.Content>
      )}
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
