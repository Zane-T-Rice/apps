"use client";

import { Box, Tabs } from "@chakra-ui/react";
import { NavigationBar } from "../ui/navigation_bar";
import { FaCity } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { GloomhavenCompanionCampaignTabContent } from "./gloomhaven_companion_campaign_tab_content";
import { GloomhavenCompanionScenarioTabContent } from "./gloomhaven_companion_scenario_tab_content";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { GiMeepleGroup } from "react-icons/gi";
import { FiHexagon } from "react-icons/fi";
import { useSearchParams } from "next/navigation";
import { useQueryString } from "@/app/utils/use_query_string";
import { GloomhavenCompanionAllyEnemyTabContent } from "./gloomhaven_companion_allies_enemies_tab_content";

export default function GloomhavenCompanionPageContent() {
  const searchParams = useSearchParams();
  const { setQueryString } = useQueryString();
  const [activeTab, setActiveTab] = useState<string>();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();
  const [selectedScenario, setSelectedScenario] = useState<Scenario>();
  const selectedEnemyRef = useRef<HTMLDivElement | null>(null);
  const selectedAllyRef = useRef<HTMLDivElement | null>(null);

  const onCampaignSelect = (campaign: Campaign) => {
    if (selectedCampaign?.entity === campaign.entity) return;
    setSelectedCampaign(campaign);
    setSelectedScenario(undefined);
  };

  useEffect(() => {
    const moveToEnemies = async () => {
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
        setActiveTab("enemies");
      }
    };

    moveToEnemies();
  }, [selectedCampaign, selectedScenario, searchParams]);

  useEffect(() => {
    // I cannot figure out how to automatically scroll without
    // waiting for the next cycle by using setTimeout.
    if (activeTab === "enemies") {
      setTimeout(
        () =>
          selectedEnemyRef?.current?.scrollIntoView({
            block: "center",
            behavior: "instant",
          }),
        1,
      );
    }

    // I cannot figure out how to automatically scroll without
    // waiting for the next cycle by using setTimeout.
    if (activeTab === "allies") {
      setTimeout(
        () =>
          selectedAllyRef?.current?.scrollIntoView({
            block: "center",
            behavior: "instant",
          }),
        1,
      );
    }
  }, [activeTab, selectedEnemyRef, selectedAllyRef]);

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
        value="enemies"
        onClick={() => {
          if (activeTab !== "enemies" && activeTab !== "allies")
            setQueryString(selectedCampaign?.id, selectedScenario?.id);
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
          if (activeTab !== "enemies" && activeTab !== "allies")
            setQueryString(selectedCampaign?.id, selectedScenario?.id);
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
          />
        </Tabs.Content>
      )}
      {selectedCampaign && selectedScenario && (
        <Tabs.Content value="enemies">
          <GloomhavenCompanionAllyEnemyTabContent
            selectedCampaign={selectedCampaign}
            selectedScenario={selectedScenario}
            type="enemy"
            selectedEnemyRef={selectedEnemyRef}
            selectedAllyRef={selectedAllyRef}
          />
        </Tabs.Content>
      )}
      {selectedCampaign && selectedScenario && (
        <Tabs.Content value="allies">
          <GloomhavenCompanionAllyEnemyTabContent
            selectedCampaign={selectedCampaign}
            selectedScenario={selectedScenario}
            type="ally"
            selectedEnemyRef={selectedEnemyRef}
            selectedAllyRef={selectedAllyRef}
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
