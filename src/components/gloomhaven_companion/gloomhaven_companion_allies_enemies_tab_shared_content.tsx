import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  Figure,
  useFigures,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { Tabs } from "@chakra-ui/react";
import { GloomhavenCompanionAllyEnemyTabContent } from "./gloomhaven_companion_allies_enemies_tab_content";
import { responseTransformer } from "@/app/utils/gloomhaven_companion_service/response_transformer";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { useWebSocket } from "@/app/utils/use_websocket";
import { v4 as uuid } from "uuid";
import { useQueryString } from "@/app/utils/use_query_string";

export function GloomhavenCompanionAllyEnemyTabSharedContent(props: {
  selectedCampaign: Campaign;
  selectedScenario: Scenario;
  activeTab: string;
  templates: Template[];
  scroll: boolean;
  setScroll: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    selectedCampaign,
    selectedScenario,
    activeTab,
    templates,
    scroll,
    setScroll,
  } = props;

  const [selectedEnemyFigure, setSelectedEnemyFigure] = useState<
    Figure | undefined
  >();
  const [selectedAllyFigure, setSelectedAllyFigure] = useState<
    Figure | undefined
  >();
  const selectedEnemyRef = useRef<HTMLDivElement | null>(null);
  const selectedAllyRef = useRef<HTMLDivElement | null>(null);
  const [figures, setFigures] = useState<Figure[]>([{ id: "" } as Figure]);
  const { setQueryString, getQueryString } = useQueryString();
  const [figuresLoading, setFiguresLoading] = useState<boolean>(true);
  const [scrollAttempts, setScrollAttempts] = useState<number>(0);

  useEffect(() => {
    const doScroll = async () => {
      if (scroll) {
        const [ref, queryStringName] =
          activeTab === "enemies"
            ? [selectedEnemyRef, "enemyId"]
            : activeTab === "allies"
              ? [selectedAllyRef, "allyId"]
              : [null, null];

        setTimeout(() => {
          ref?.current?.scrollIntoView({
            block: "center",
            behavior: "smooth",
          });
          // If the system is automatically going to select something that exists,
          // but it has not managed to render it to select it yet,
          // then keep trying to scroll to it until it works.
          //
          // This happens both during hard refreshes and when simply switching
          // between the enemies and allies tabs when there are a few cards
          // present already.
          if (
            figuresLoading ||
            ((activeTab === "enemies" || activeTab === "allies") &&
              !ref?.current?.checkVisibility() &&
              figures.findIndex(
                (figure) =>
                  figure.id === getQueryString().get(queryStringName || ""),
              ) !== -1)
          ) {
            setScrollAttempts((prev) => prev + 1);

            if (scrollAttempts < 25) setScroll(true);
            else {
              // Stop trying to scroll. Maybe the client lost internet connection
              // and cannot load the figures or has a really weak processor.
              setScroll(false);
              setScrollAttempts(0);
            }
          } else {
            setScrollAttempts(0);
          }
        }, 250);

        setScroll(false);
      }
    };

    doScroll();
  }, [
    activeTab,
    scroll,
    setScroll,
    scrollAttempts,
    setScrollAttempts,
    selectedEnemyRef,
    selectedAllyRef,
    selectedEnemyFigure,
    selectedAllyFigure,
    getQueryString,
    figures,
    figuresLoading,
  ]);

  const [websocketID] = useState<string>(uuid());

  const {
    getAllREST: getFigures,
    createREST: createFigure,
    editREST: editFigure,
    deleteREST: deleteFigure,
  } = useFigures(selectedCampaign.id, selectedScenario.id, responseTransformer);

  const onFigureSelect = (figure: Figure, type: string) => {
    if (type === "ally") {
      if (figure.id !== selectedAllyFigure?.id) {
        setSelectedAllyFigure(figure);
        setQueryString("allyId", figure.id);
      }
    } else if (type == "enemy") {
      if (figure.id !== selectedEnemyFigure?.id) {
        setSelectedEnemyFigure(figure);
        setQueryString("enemyId", figure.id);
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
    if (!refresh) return;
    const getAllFigures = async () => {
      setRefresh(false);
      getFigures().then((responseFigures) => {
        if (responseFigures) {
          setFigures((prev) => {
            if (
              prev[0] &&
              prev[0].id !== "" &&
              figures[0] &&
              figures[0].id === ""
            )
              return prev;
            return responseFigures;
          });
          setFiguresLoading(false);
        }
      });
    };
    getAllFigures();
  }, [refresh, figures, setRefresh, setFiguresLoading, setFigures, getFigures]);

  useEffect(() => {
    const reset = async () => {
      setFiguresLoading(true);
      setFigures([{ id: "" } as Figure]);
      setSelectedAllyFigure(undefined);
      setSelectedEnemyFigure(undefined);
      selectedAllyRef.current = null;
      selectedEnemyRef.current = null;
    };
    reset();
  }, [
    selectedScenario.id,
    selectedCampaign.id,
    setSelectedEnemyFigure,
    setSelectedAllyFigure,
    setRefresh,
  ]);

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
          isLoading={figuresLoading}
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
          isLoading={figuresLoading}
        />
      </Tabs.Content>
    </>
  );
}
