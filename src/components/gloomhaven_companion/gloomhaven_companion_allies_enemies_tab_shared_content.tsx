import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
import { useTableState } from "@/app/utils/gloomhaven_companion_ui/use_table_state";
import {
  buildTurnList,
  collectTurnGroups,
  hasRoundStarted,
  planFigureRemoved,
  planInitiative,
  planRest,
  restKey,
  SECOND_INITIATIVE_PREFIX,
  planSpawn,
} from "@/app/utils/gloomhaven_companion_ui/table_state";
import { TableStatus } from "../ui/table_status";

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
      if (scroll && (activeTab === "enemies" || activeTab === "allies")) {
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
            (!ref?.current?.checkVisibility() &&
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
            setScroll(false);
            setScrollAttempts(0);
          }
        }, 250);
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

  const { state, reloadState, onStateMessage, saveState } = useTableState(
    selectedCampaign.id,
    selectedScenario.id,
  );

  const { sendMessage, refresh, setRefresh } = useWebSocket<Figure>({
    campaignId: selectedCampaign.id,
    scenarioId: selectedScenario.id,
    websocketId: websocketID,
    setResources: setFigures,
    onStateMessage,
  });

  const onSaveState = useCallback(
    (entries: [string, string][]) => saveState(entries, sendMessage),
    [saveState, sendMessage],
  );
  // An enemy that appears once the round has started takes a turn right after the current one.
  const onSpawn = useCallback(
    (figure: Figure) => {
      const spawn = planSpawn(collectTurnGroups(figures, state), state, figure);
      if (spawn) onSaveState([spawn]);
    },
    [figures, state, onSaveState],
  );
  // A group's initiative is entered after the round has started, so it may need to go after the
  // current turn.
  const onInitiativeChange = useCallback(
    (key: string, value: string) =>
      onSaveState(
        // The second card only breaks ties, so it never changes where a group goes late.
        key.startsWith(SECOND_INITIATIVE_PREFIX)
          ? [[key, value]]
          : planInitiative(
              collectTurnGroups(figures, state),
              state,
              key,
              value,
            ),
      ),
    [figures, state, onSaveState],
  );
  // A removed figure leaves the turn order, and a group with none left is out of the round.
  const onFigureRemoved = useCallback(
    (figure: Figure) => {
      const entries = planFigureRemoved(figures, state, figure);
      if (entries.length > 0) onSaveState(entries);
    },
    [figures, state, onSaveState],
  );
  // A standee that does not act this round, such as a summoned monster. This reads the latest figures
  // and state when it runs, so the cards are not all drawn again whenever those change.
  const latest = useRef({ figures, state });
  useEffect(() => {
    latest.current = { figures, state };
  });
  const onRestChange = useCallback(
    (figure: Figure, resting: boolean) =>
      onSaveState(
        planRest(latest.current.figures, latest.current.state, figure, resting),
      ),
    [onSaveState],
  );
  // A summon of a player that shows up once the round has started does not act in that round, so
  // it must not jump in as the current turn. It can be set to act from its card.
  const onFigureCreated = useCallback(
    (figure: Figure) => {
      if (
        figure.alignment !== "ally" ||
        figure.rank?.toLowerCase() !== "summon"
      )
        return;
      const { figures, state } = latest.current;
      const groups = collectTurnGroups(figures, state);
      if (hasRoundStarted(groups, buildTurnList(groups, state), state))
        onSaveState([[restKey(figure.id), "1"]]);
    },
    [onSaveState],
  );
  const tableStatus = (
    <TableStatus
      state={state}
      turnGroups={collectTurnGroups(figures, state)}
      saveState={onSaveState}
    />
  );

  // Sometimes the websocket will tell the listener to refresh all data
  // whenever it (re)connects.
  useEffect(() => {
    if (!refresh) return;
    const getAllFigures = async () => {
      setRefresh(false);
      reloadState();
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
  }, [
    refresh,
    figures,
    setRefresh,
    setFiguresLoading,
    setFigures,
    getFigures,
    reloadState,
  ]);

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
      <Tabs.Content tabIndex={-1} value="enemies">
        {tableStatus}
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
          state={state}
          onInitiativeChange={onInitiativeChange}
          onSpawn={onSpawn}
          onFigureRemoved={onFigureRemoved}
          onRestChange={onRestChange}
          onFigureCreated={onFigureCreated}
        />
      </Tabs.Content>
      <Tabs.Content tabIndex={-1} value="allies">
        {tableStatus}
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
          state={state}
          onInitiativeChange={onInitiativeChange}
          onSpawn={onSpawn}
          onFigureRemoved={onFigureRemoved}
          onRestChange={onRestChange}
          onFigureCreated={onFigureCreated}
        />
      </Tabs.Content>
    </>
  );
}
