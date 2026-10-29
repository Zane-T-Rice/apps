"use client";

import { Box, Tabs } from "@chakra-ui/react";
import { NavigationBar } from "../ui/navigation_bar";
import { FaCity } from "react-icons/fa";
import { useCallback, useEffect, useState } from "react";
import { GloomhavenCompanionCampaignTabContent } from "./gloomhaven_companion_campaign_tab_content";
import { GloomhavenCompanionScenarioTabContent } from "./gloomhaven_companion_scenario_tab_content";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { GiMeepleGroup } from "react-icons/gi";
import { FiHexagon } from "react-icons/fi";
import { FaClone } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import { useQueryString } from "@/app/utils/use_query_string";
import { GloomhavenCompanionAllyEnemyTabSharedContent } from "./gloomhaven_companion_allies_enemies_tab_shared_content";
import {
  Template,
  useTemplates,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import {
  Edition,
  useEditions,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_editions";
import { EditionsContext } from "@/app/utils/gloomhaven_companion_ui/editions_context";
import { GloomhavenCompanionTemplatesTabContent } from "./gloomhaven_companion_templates_tab_content";
import { responseTransformer } from "@/app/utils/gloomhaven_companion_service/response_transformer";

export default function GloomhavenCompanionPageContent() {
  const searchParams = useSearchParams();
  const { setQueryString, replaceQueryString } = useQueryString();
  const [activeTab, setActiveTab] = useState<string>("campaigns");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();
  const [selectedScenario, setSelectedScenario] = useState<Scenario>();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editions, setEditions] = useState<Edition[]>([]);
  const { getAllREST: getTemplates } = useTemplates(responseTransformer);
  const { getAllREST: getEditions } = useEditions(responseTransformer);
  const [scroll, setScroll] = useState<boolean>(false);

  const reloadTemplates = useCallback(async () => {
    const [responseTemplates, responseEditions] = await Promise.all([
      getTemplates(),
      getEditions(),
    ]);
    if (responseTemplates) setTemplates(responseTemplates);
    if (responseEditions) setEditions(responseEditions);
  }, [getTemplates, getEditions]);

  useEffect(() => {
    const getAllTemplates = async () => {
      reloadTemplates();
    };
    const selectActiveTab = async () => {
      const lastActiveTab = searchParams.get("activeTab");
      if (lastActiveTab) setActiveTab(lastActiveTab);
      if (lastActiveTab === "enemies" || lastActiveTab === "allies")
        setScroll(true);
    };
    getAllTemplates();
    selectActiveTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCampaignSelect = (campaign: Campaign) => {
    if (selectedCampaign?.entity === campaign.entity) return;
    const params: URLSearchParams = new URLSearchParams();
    params.set("campaignId", campaign.id);
    replaceQueryString(params);
    setSelectedCampaign(campaign);
    setSelectedScenario(undefined);
  };

  const onScenarioSelect = (scenario: Scenario) => {
    if (scenario.entity === selectedScenario?.entity) return;
    const params: URLSearchParams = new URLSearchParams();
    params.set("campaignId", selectedCampaign?.id || "");
    params.set("scenarioId", scenario.id);
    replaceQueryString(params);
    setSelectedScenario(scenario);
  };

  const actions = <></>;

  const tabTriggers = (
    <>
      <Tabs.Trigger
        tabIndex={0}
        value="campaigns"
        onClick={() => {
          if (activeTab !== "campaigns")
            setQueryString("activeTab", "campaigns");
        }}
      >
        <Box hideBelow="sm">
          <FaCity />
        </Box>
        Campaigns
      </Tabs.Trigger>
      <Tabs.Trigger
        tabIndex={0}
        value="scenarios"
        onClick={() => {
          if (activeTab !== "scenarios")
            setQueryString("activeTab", "scenarios");
        }}
        disabled={!selectedCampaign}
      >
        <Box hideBelow="sm">
          <FiHexagon />
        </Box>
        Scenarios
      </Tabs.Trigger>
      <Tabs.Trigger
        tabIndex={0}
        value="enemies"
        onClick={() => {
          setScroll(true);
          if (activeTab !== "enemies") setQueryString("activeTab", "enemies");
        }}
        disabled={!selectedCampaign || !selectedScenario}
      >
        <Box hideBelow="sm">
          <GiMeepleGroup />
        </Box>
        Enemies
      </Tabs.Trigger>
      <Tabs.Trigger
        tabIndex={0}
        value="allies"
        onClick={() => {
          setScroll(true);
          if (activeTab !== "allies") setQueryString("activeTab", "allies");
        }}
        disabled={!selectedCampaign || !selectedScenario}
      >
        <Box hideBelow="sm">
          <GiMeepleGroup />
        </Box>
        Allies
      </Tabs.Trigger>
      <Tabs.Trigger
        tabIndex={0}
        value="templates"
        onClick={() => {
          if (activeTab !== "templates")
            setQueryString("activeTab", "templates");
        }}
      >
        <Box hideBelow="sm">
          <FaClone />
        </Box>
        Templates
      </Tabs.Trigger>
    </>
  );

  const tabContents = (
    <>
      <Tabs.Content tabIndex={-1} value="campaigns">
        <GloomhavenCompanionCampaignTabContent
          selectedCampaign={selectedCampaign}
          setSelectedCampaign={setSelectedCampaign}
          onCampaignSelect={onCampaignSelect}
        />
      </Tabs.Content>
      {selectedCampaign && (
        <Tabs.Content tabIndex={-1} value="scenarios">
          <GloomhavenCompanionScenarioTabContent
            selectedCampaign={selectedCampaign}
            selectedScenario={selectedScenario}
            setSelectedScenario={setSelectedScenario}
            onScenarioSelect={onScenarioSelect}
            templates={templates}
          />
        </Tabs.Content>
      )}
      <Tabs.Content tabIndex={-1} value="templates">
        <GloomhavenCompanionTemplatesTabContent
          templates={templates}
          setTemplates={setTemplates}
          editions={editions}
          setEditions={setEditions}
          reload={reloadTemplates}
        />
      </Tabs.Content>
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
    <EditionsContext.Provider value={editions}>
      <NavigationBar
        defaultTab="campaigns"
        tabTriggers={tabTriggers}
        tabContents={tabContents}
        actions={actions}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </EditionsContext.Provider>
  );
}
