import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { number, object, string } from "yup";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";
import { GloomhavenCompanionEnemyTabContent } from "./gloomhaven_companion_enemies_tab_content";
import { GloomhavenCompanionAllyTabContent } from "./gloomhaven_companion_allies_tab_content";
import { useQueryString } from "@/app/utils/use_query_string";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";

export type Group = {
  class: string;
  figures: Figure[];
};

const transformInt = (value: number) => {
  return isNaN(value) ? undefined : value;
};

export function GloomhavenCompanionAllyEnemyTabContent(props: {
  selectedCampaign: Campaign;
  selectedScenario: Scenario;
  type: "ally" | "enemy";
  selectedEnemyRef: RefObject<HTMLDivElement | null>;
  selectedAllyRef: RefObject<HTMLDivElement | null>;
  selectedFigure: Figure | undefined;
  setSelectedFigure: Dispatch<SetStateAction<Figure | undefined>>;
  figures: Figure[];
  setFigures: Dispatch<SetStateAction<Figure[]>>;
  templates: Template[];
  createFigure?: (resource: Figure) => Promise<Figure | null>;
  editFigure?: (resource: Figure) => Promise<Figure | null>;
  deleteFigure?: (resource: Figure) => Promise<Figure | null>;
  sendMessage?: (resource: Figure, action: string) => void;
  getFigures: () => Promise<Figure[] | null>;
  onFigureSelect: (figure: Figure, type: string) => void;
  isLoading: boolean;
}) {
  const {
    selectedCampaign,
    selectedScenario,
    type,
    selectedEnemyRef,
    selectedAllyRef,
    selectedFigure,
    setSelectedFigure,
    figures,
    setFigures,
    templates,
    createFigure,
    editFigure,
    deleteFigure,
    sendMessage,
    getFigures,
    onFigureSelect,
    isLoading,
  } = props;
  const { getQueryString } = useQueryString();

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

  const [createFigureSchemaState] =
    useState<typeof createFigureSchema>(createFigureSchema);
  const [editFigureSchemaState] =
    useState<typeof editFigureSchema>(editFigureSchema);
  const [deleteFigureSchemaState] =
    useState<typeof deleteFigureSchema>(deleteFigureSchema);

  const {
    onResourceCreate: onFigureCreate,
    onResourceEdit: _onFigureEdit,
    onResourceDelete: onFigureDelete,
  } = useOnCRUD<
    Figure,
    typeof createFigureSchemaState,
    typeof editFigureSchemaState,
    typeof deleteFigureSchemaState
  >({
    resourceNameKey: "class",
    createResourceSchema: createFigureSchemaState,
    editResourceSchema: editFigureSchemaState,
    deleteResourceSchema: deleteFigureSchemaState,
    createResource: createFigure,
    editResource: editFigure,
    deleteResource: deleteFigure,
    setResources: setFigures,
    setSelectedResource: setSelectedFigure,
    sendMessage,
  });

  const onFigureEdit = useCallback(
    async (newResource: Figure, silent?: boolean): Promise<boolean> => {
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
    },
    [_onFigureEdit, getFigures, setFigures],
  );

  useEffect(() => {
    const params = getQueryString();

    if (type === "enemy") {
      const selectedEnemyId = params.get("selectedEnemyId");
      if (selectedEnemyId) {
        const figure = figures?.find((figure) => figure.id === selectedEnemyId);
        if (figure) onFigureSelect(figure, "enemy");
      }
    } else if (type === "ally") {
      const selectedAllyId = params.get("selectedAllyId");
      if (selectedAllyId) {
        const figure = figures?.find((figure) => figure.id === selectedAllyId);
        if (figure) onFigureSelect(figure, "ally");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaign, selectedScenario, figures]);

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
          templates={templates}
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
