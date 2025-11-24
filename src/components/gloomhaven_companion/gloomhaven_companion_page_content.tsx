"use client";

import { Box, Tabs } from "@chakra-ui/react";
import { NavigationBar } from "../ui/navigation_bar";
import { FaCity } from "react-icons/fa";
import { useEffect, useState } from "react";
import { GloomhavenCompanionCampaignTabContent } from "./gloomhaven_companion_campaign_tab_content";
import { GloomhavenCompanionScenarioTabContent } from "./gloomhaven_companion_scenario_tab_content";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { GiMeepleGroup } from "react-icons/gi";
import { FiHexagon } from "react-icons/fi";
import { useSearchParams } from "next/navigation";
import { useQueryString } from "@/app/utils/use_query_string";
import { GloomhavenCompanionAllyEnemyTabSharedContent } from "./gloomhaven_companion_allies_enemies_tab_shared_content";
import {
  Template,
  useTemplates,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { responseTransformer } from "@/app/utils/gloomhaven_companion_service/response_transformer";

export default function GloomhavenCompanionPageContent() {
  const searchParams = useSearchParams();
  const { clearQueryString, replaceQueryString } = useQueryString();
  const [activeTab, setActiveTab] = useState<string>("campaigns");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();
  const [selectedScenario, setSelectedScenario] = useState<Scenario>();
  const [templates, setTemplates] = useState<Template[]>([]);
  const { getAllREST: getTemplates } = useTemplates(responseTransformer);
  const [scroll, setScroll] = useState<boolean>(false);

  useEffect(() => {
    const getAllTemplates = async () => {
      getTemplates().then((responseTemplates) => {
        if (responseTemplates) setTemplates(responseTemplates);
      });
    };
    getAllTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCampaignSelect = (campaign: Campaign) => {
    if (selectedCampaign?.entity === campaign.entity) return;
    setSelectedCampaign(campaign);
    setSelectedScenario(undefined);
  };

  useEffect(() => {
    const moveToEnemies = async () => {
      if (selectedCampaign && selectedScenario) {
        if (searchParams.get("selectedEnemyId")) {
          setActiveTab("enemies");
          setScroll(true);
        } else if (searchParams.get("selectedAllyId")) {
          setActiveTab("allies");
          setScroll(true);
        }
      }
    };

    moveToEnemies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaign, selectedScenario]);

  const actions = <></>;

  const tabTriggers = (
    <>
      <Tabs.Trigger
        value="campaigns"
        onClick={() => {
          if (activeTab !== "campaigns") {
            clearQueryString();
          }
        }}
      >
        <Box hideBelow="sm">
          <FaCity />
        </Box>
        Campaigns
      </Tabs.Trigger>
      <Tabs.Trigger
        value="scenarios"
        onClick={() => {
          if (activeTab !== "scenarios") {
            const params = new URLSearchParams();
            params.set("campaignId", selectedCampaign?.id || "");
            replaceQueryString(params);
          }
        }}
        disabled={!selectedCampaign}
      >
        <Box hideBelow="sm">
          <FiHexagon />
        </Box>
        Scenarios
      </Tabs.Trigger>
      <Tabs.Trigger
        value="enemies"
        onClick={() => {
          setActiveTab("enemies");
          setScroll(true);
          if (activeTab !== "enemies" && activeTab !== "allies") {
            const params = new URLSearchParams();
            params.set("campaignId", selectedCampaign?.id || "");
            params.set("scenarioId", selectedScenario?.id || "");
            replaceQueryString(params);
          }
        }}
        disabled={!selectedCampaign || !selectedScenario}
      >
        <Box hideBelow="sm">
          <GiMeepleGroup />
        </Box>
        Enemies
      </Tabs.Trigger>
      <Tabs.Trigger
        value="allies"
        onClick={() => {
          setActiveTab("allies");
          setScroll(true);
          if (activeTab !== "enemies" && activeTab !== "allies") {
            const params = new URLSearchParams();
            params.set("campaignId", selectedCampaign?.id || "");
            params.set("scenarioId", selectedScenario?.id || "");
            replaceQueryString(params);
          }
        }}
        disabled={!selectedCampaign || !selectedScenario}
      >
        <Box hideBelow="sm">
          <GiMeepleGroup />
        </Box>
        Allies
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
            templates={templates}
          />
        </Tabs.Content>
      )}
      {selectedCampaign && selectedScenario && activeTab && (
        <GloomhavenCompanionAllyEnemyTabSharedContent
          activeTab={activeTab}
          selectedCampaign={selectedCampaign}
          selectedScenario={selectedScenario}
          templates={templates}
          scroll={scroll}
          setScroll={setScroll}
        />
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
