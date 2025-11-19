import { RefObject, useEffect, useState } from "react";
import {
  Figure,
  useFigures,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { number, object, string } from "yup";
import { responseTransformer } from "@/app/utils/gloomhaven_companion_service/response_transformer";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";
import { useWebSocket } from "../../app/utils/use_websocket";
import { v4 as uuid } from "uuid";
import {
  Template,
  useTemplates,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { GloomhavenCompanionEnemyTabContent } from "./gloomhaven_companion_enemies_tab_content";
import { GloomhavenCompanionAllyTabContent } from "./gloomhaven_companion_allies_tab_content";

const transformInt = (value: number) => {
  return isNaN(value) ? undefined : value;
};

export type Group = {
  class: string;
  figures: Figure[];
};

const stringSchema = string().nullable();
const numberSchema = number().transform(transformInt).integer().nullable();

const createFigureSchema = object({
  rank: stringSchema.optional(),
  class: stringSchema.required(),
  maximumHP: numberSchema.required(),
  damage: numberSchema.required(),
  name: stringSchema.optional(),
  number: numberSchema.optional(),
  shield: numberSchema.optional(),
  retaliate: numberSchema.optional(),
  move: numberSchema.optional(),
  attack: numberSchema.optional(),
  target: numberSchema.optional(),
  xp: numberSchema.optional(),
  innateDefenses: stringSchema.optional(),
  innateOffenses: stringSchema.optional(),
  statuses: stringSchema.optional(),
  pierce: numberSchema.optional(),
  special: stringSchema.optional(),
}).stripUnknown();

const editFigureSchema = createFigureSchema
  .concat(
    object({
      id: string().required(),
      updatedAt: string().required(),
    }),
  )
  .stripUnknown();

const deleteFigureSchema = object({
  id: stringSchema.required(),
}).stripUnknown();

export function GloomhavenCompanionAllyEnemyTabContent(props: {
  selectedCampaign: Campaign;
  selectedScenario: Scenario;
  type: "ally" | "enemy";
  selectedEnemyRef: RefObject<HTMLDivElement | null>;
  selectedAllyRef: RefObject<HTMLDivElement | null>;
}) {
  const {
    selectedCampaign,
    selectedScenario,
    type,
    selectedEnemyRef,
    selectedAllyRef,
  } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [figures, setFigures] = useState<Figure[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedFigure, setSelectedFigure] = useState<Figure>();
  const [websocketID] = useState<string>(uuid());

  const {
    getAllREST: getFigures,
    createREST: createFigure,
    editREST: editFigure,
    deleteREST: deleteFigure,
  } = useFigures(selectedCampaign.id, selectedScenario.id, responseTransformer);

  const { getAllREST: getTemplates } = useTemplates(responseTransformer);

  useEffect(() => {
    getFigures().then((responseFigures) => {
      if (responseFigures) setFigures(responseFigures);
      setIsLoading(false);
    });

    getTemplates().then((responseTemplates) => {
      if (responseTemplates) setTemplates(responseTemplates);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaign, selectedScenario]);

  const onFigureSelect = (figure: Figure) => {
    setSelectedFigure(figure);
  };

  const { sendMessage, refresh, setRefresh } = useWebSocket<Figure>({
    campaignId: selectedCampaign.id,
    scenarioId: selectedScenario.id,
    websocketId: websocketID,
    setResources: setFigures,
  });

  // Sometimes the websocket will tell the listener to refresh all data.
  useEffect(() => {
    if (!refresh) return;
    getFigures().then((responseFigures) => {
      if (responseFigures) setFigures(responseFigures);
    });
    setRefresh(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const {
    onResourceCreate: onFigureCreate,
    onResourceEdit: _onFigureEdit,
    onResourceDelete: onFigureDelete,
  } = useOnCRUD<
    Figure,
    typeof createFigureSchema,
    typeof editFigureSchema,
    typeof deleteFigureSchema
  >({
    resourceNameKey: "class",
    createResourceSchema: createFigureSchema,
    editResourceSchema: editFigureSchema,
    deleteResourceSchema: deleteFigureSchema,
    createResource: createFigure,
    editResource: editFigure,
    deleteResource: deleteFigure,
    setResources: setFigures,
    setSelectedResource: setSelectedFigure,
    sendMessage,
  });

  const onFigureEdit = async (
    newResource: Figure,
    silent?: boolean,
  ): Promise<boolean> => {
    const result = await _onFigureEdit(newResource, silent);
    // Try to freshen the data. Edit failures are usually from stale data
    // with old updatedAt values.
    if (!result) {
      const responseFigures = await getFigures();
      if (responseFigures) {
        setFigures(responseFigures);
      }
    }
    return result;
  };

  return (
    <>
      {type === "enemy" && (
        <GloomhavenCompanionEnemyTabContent
          selectedScenario={selectedScenario}
          figures={figures}
          templates={templates}
          isLoading={isLoading}
          selectedFigure={selectedFigure}
          onFigureCreate={onFigureCreate}
          onFigureDelete={onFigureDelete}
          onFigureEdit={onFigureEdit}
          onFigureSelect={onFigureSelect}
          ref={selectedEnemyRef}
        />
      )}
      {type === "ally" && (
        <GloomhavenCompanionAllyTabContent
          figures={figures}
          isLoading={isLoading}
          selectedFigure={selectedFigure}
          onFigureCreate={onFigureCreate}
          onFigureDelete={onFigureDelete}
          onFigureEdit={onFigureEdit}
          onFigureSelect={onFigureSelect}
          ref={selectedAllyRef}
        />
      )}
    </>
  );
}
