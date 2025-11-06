import { Card, Grid, GridItem, Skeleton, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  Figure,
  useFigures,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { number, object, string } from "yup";
import CRUDButtons from "../ui/crud_buttons";
import { responseTransformer } from "@/app/utils/gloomhaven_companion_service/response_transformer";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";
import { FigureCard } from "../ui/figure_card";
import { useWebSocket } from "../ui/websocket";

const transformInt = (value: number) => {
  return isNaN(value) ? undefined : value;
};

const stringSchema = string().nullable();
const numberSchema = number().transform(transformInt).integer().nullable();

const createFigureSchema = object({
  rank: stringSchema.required(),
  class: stringSchema.required(),
  maximumHP: numberSchema.required(),
  damage: numberSchema.required(),
  name: stringSchema.optional(),
  number: numberSchema.optional(),
  shield: numberSchema.optional(),
  move: numberSchema.optional(),
  attack: numberSchema.optional(),
  xp: numberSchema.optional(),
  innateDefenses: stringSchema.optional(),
  innateOffenses: stringSchema.optional(),
  statuses: stringSchema.optional(),
}).stripUnknown();

const editFigureSchema = createFigureSchema
  .concat(
    object({
      id: stringSchema.required(),
    }),
  )
  .stripUnknown();

const deleteFigureSchema = object({
  id: stringSchema.required(),
}).stripUnknown();

export function GloomhavenCompanionFigureTabContent(props: {
  selectedCampaign: Campaign;
  selectedScenario: Scenario;
}) {
  const { selectedCampaign, selectedScenario } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [figures, setFigures] = useState<Figure[]>([]);
  const [selectedFigure, setSelectedFigure] = useState<Figure>();
  const [createFigureRecord] = useState<Figure>({
    id: "",
    parent: "",
    entity: "",
    name: "",
    maximumHP: 0,
    damage: 0,
    class: "",
    number: 0,
    rank: "",
    shield: 0,
    move: 0,
    attack: 0,
    xp: 0,
    innateDefenses: "",
    innateOffenses: "",
    statuses: "",
  });

  const {
    getAllREST: getFigures,
    createREST: createFigure,
    editREST: editFigure,
    deleteREST: deleteFigure,
  } = useFigures(selectedCampaign.id, selectedScenario.id, responseTransformer);

  useEffect(() => {
    getFigures().then((responseFigures) => {
      if (responseFigures) setFigures(responseFigures);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaign, selectedScenario]);

  const onFigureSelect = (figure: Figure) => {
    setSelectedFigure(figure);
  };

  const { sendMessage, messages } = useWebSocket<Figure>({
    campaignId: selectedCampaign.id,
    scenarioId: selectedScenario.id,
  });

  useEffect(() => {
    getFigures().then((responseFigures) => {
      if (responseFigures) setFigures(responseFigures);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const {
    onResourceCreate: onFigureCreate,
    onResourceEdit: onFigureEdit,
    onResourceDelete: onFigureDelete,
  } = useOnCRUD<
    Figure,
    typeof createFigureSchema,
    typeof editFigureSchema,
    typeof deleteFigureSchema
  >({
    resourceNameKey: "name",
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

  const collectGroups = (figures: Figure[]): Array<Figure[]> => {
    const groups: { [Property in string]: Figure[] } = {};

    figures.forEach((figure) => {
      if (!groups[figure.class]) groups[figure.class] = [figure];
      else groups[figure.class].push(figure);
    });

    return Object.keys(groups)
      .sort()
      .map((key) =>
        groups[key]
          .sort((figureA, figureB) => {
            if (figureA.number < figureB.number) return -1;
            else if (figureA.number === figureB.number) return 0;
            else return 1;
          })
          .sort((figureA, figureB) => {
            if (
              figureA.rank.toLowerCase() === "normal" &&
              figureB.rank.toLowerCase() === "elite"
            )
              return 1;
            else if (
              figureA.rank.toLowerCase() === "elite" &&
              figureB.rank.toLowerCase() === "normal"
            )
              return -1;
            else return 0;
          }),
      );
  };

  return (
    <>
      {isLoading ? (
        <Stack direction="column" marginLeft={2} marginRight={2}>
          <Skeleton height={50} variant="shine" />
          <Skeleton height={250} variant="shine" />
          <Skeleton height={50} variant="shine" />
        </Stack>
      ) : (
        <Stack gap="1">
          <CRUDButtons
            omitKeys={["id", "parent", "entity"]}
            selectedRecord={selectedFigure}
            createPermission="gloomhaven-companion:public"
            creationRecord={createFigureRecord}
            onCreate={onFigureCreate}
            createResourceSchema={createFigureSchema}
            editPermission="gloomhaven-companion:public"
            onEdit={onFigureEdit}
            editResourceSchema={editFigureSchema}
            deletePermission="gloomhaven-companion:public"
            onDelete={onFigureDelete}
            marginLeft={3}
            marginRight={3}
          />
          {collectGroups(figures).map((groups, groupIndex) => {
            return (
              <Card.Root
                key={`group-card-${groupIndex}`}
                bg={"bg.emphasized"}
                marginLeft={3}
                marginRight={3}
              >
                <Card.Body>
                  <Grid
                    key={`group-grid-${groupIndex}`}
                    templateColumns={{
                      base: "repeat(1, 1fr)",
                      md: "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                    }}
                    gap="0"
                  >
                    {groups.map((figure, figureIndex) => {
                      return (
                        <GridItem
                          colSpan={1}
                          key={`navigation-bar-grid-item-${figureIndex}`}
                          justifyItems="center"
                          onClick={() => onFigureSelect(figure)}
                        >
                          <FigureCard
                            figure={figure}
                            selectedFigure={selectedFigure}
                            onFigureCreate={onFigureCreate}
                            onFigureDelete={onFigureDelete}
                            onFigureEdit={onFigureEdit}
                          />
                        </GridItem>
                      );
                    })}
                  </Grid>
                </Card.Body>
              </Card.Root>
            );
          })}
        </Stack>
      )}
    </>
  );
}
