import { useEffect, useRef, useState } from "react";
import {
  Figure,
  useFigures,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { Tabs } from "@chakra-ui/react";
import { GloomhavenCompanionAllyEnemyTabContent } from "./gloomhaven_companion_allies_enemies_tab_content";
import { responseTransformer } from "@/app/utils/gloomhaven_companion_service/response_transformer";
import {
  Template,
  useTemplates,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { useWebSocket } from "@/app/utils/use_websocket";
import { v4 as uuid } from "uuid";
import { useQueryString } from "@/app/utils/use_query_string";

export function GloomhavenCompanionAllyEnemyTabSharedContent(props: {
  selectedCampaign: Campaign;
  selectedScenario: Scenario;
  activeTab: string;
}) {
  const { selectedCampaign, selectedScenario, activeTab } = props;

  const [selectedEnemyFigure, setSelectedEnemyFigure] = useState<
    Figure | undefined
  >();
  const [selectedAllyFigure, setSelectedAllyFigure] = useState<
    Figure | undefined
  >();
  const selectedEnemyRef = useRef<HTMLDivElement | null>(null);
  const selectedAllyRef = useRef<HTMLDivElement | null>(null);
  const [figures, setFigures] = useState<Figure[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const { setQueryString } = useQueryString();
  const [figuresLoading, setFiguresLoading] = useState<boolean>(true);
  const [templatesLoading, setTemplatesLoading] = useState<boolean>(true);

  useEffect(() => {
    // I cannot figure out how to automatically scroll without
    // waiting for the next cycle by using setTimeout.
    if (activeTab === "enemies") {
      setTimeout(
        () =>
          selectedEnemyRef?.current?.scrollIntoView({
            block: "center",
            behavior: "smooth",
          }),
        1,
      );
    } else if (activeTab === "allies") {
      setTimeout(
        () =>
          selectedAllyRef?.current?.scrollIntoView({
            block: "center",
            behavior: "smooth",
          }),
        1,
      );
    }
  }, [
    activeTab,
    selectedEnemyRef,
    selectedAllyRef,
    selectedEnemyFigure,
    selectedAllyFigure,
  ]);

  const [websocketID] = useState<string>(uuid());

  const {
    getAllREST: getFigures,
    createREST: createFigure,
    editREST: editFigure,
    deleteREST: deleteFigure,
  } = useFigures(selectedCampaign.id, selectedScenario.id, responseTransformer);

  const { getAllREST: getTemplates } = useTemplates(responseTransformer);

  const onFigureSelect = (figure: Figure, type: string) => {
    if (type === "ally") {
      if (figure.id !== selectedAllyFigure?.id) {
        setSelectedAllyFigure(figure);
        setQueryString("selectedAllyId", figure.id);
      }
    } else if (type == "enemy") {
      if (figure.id !== selectedEnemyFigure?.id) {
        setSelectedEnemyFigure(figure);
        setQueryString("selectedEnemyId", figure.id);
      }
    }
  };

  const { sendMessage, refresh, setRefresh } = useWebSocket<Figure>({
    campaignId: selectedCampaign.id,
    scenarioId: selectedScenario.id,
    websocketId: websocketID,
    setResources: setFigures,
  });

  // Sometimes the websocket will tell the listener to refresh all data
  // whenever it (re)connects.
  useEffect(() => {
    if (!refresh || figuresLoading) return;
    setRefresh(false);
    const getAllFigures = async () => {
      getFigures().then((responseFigures) => {
        if (responseFigures) setFigures(responseFigures);
      });
    };
    getAllFigures();
  }, [refresh, getFigures, getTemplates, setRefresh, figuresLoading]);

  useEffect(() => {
    const getAllTemplates = async () => {
      getTemplates().then((responseTemplates) => {
        if (responseTemplates) setTemplates(responseTemplates);
        setTemplatesLoading(false);
      });
    };
    const getAllFigures = async () => {
      getFigures().then((responseFigures) => {
        if (responseFigures) setFigures(responseFigures);
        setFiguresLoading(false);
      });
    };
    getAllTemplates();
    getAllFigures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSelectedAllyFigure(undefined);
    setSelectedEnemyFigure(undefined);
    selectedAllyRef.current = null;
    selectedEnemyRef.current = null;
  }, [selectedScenario, selectedCampaign]);

  return (
    <>
      <Tabs.Content value="enemies">
        <GloomhavenCompanionAllyEnemyTabContent
          selectedCampaign={selectedCampaign}
          selectedScenario={selectedScenario}
          type="enemy"
          selectedEnemyRef={selectedEnemyRef}
          selectedAllyRef={selectedAllyRef}
          selectedFigure={selectedEnemyFigure}
          setSelectedFigure={setSelectedEnemyFigure}
          figures={figures}
          setFigures={setFigures}
          templates={templates}
          createFigure={createFigure}
          editFigure={editFigure}
          deleteFigure={deleteFigure}
          sendMessage={sendMessage}
          getFigures={getFigures}
          onFigureSelect={onFigureSelect}
          isLoading={figuresLoading || templatesLoading}
        />
      </Tabs.Content>
      <Tabs.Content value="allies">
        <GloomhavenCompanionAllyEnemyTabContent
          selectedCampaign={selectedCampaign}
          selectedScenario={selectedScenario}
          type="ally"
          selectedEnemyRef={selectedEnemyRef}
          selectedAllyRef={selectedAllyRef}
          selectedFigure={selectedAllyFigure}
          setSelectedFigure={setSelectedAllyFigure}
          figures={figures}
          setFigures={setFigures}
          templates={templates}
          createFigure={createFigure}
          editFigure={editFigure}
          deleteFigure={deleteFigure}
          sendMessage={sendMessage}
          getFigures={getFigures}
          onFigureSelect={onFigureSelect}
          isLoading={figuresLoading || templatesLoading}
        />
      </Tabs.Content>
    </>
  );
}
