import { Card, Grid, GridItem, Skeleton, Stack, Text } from "@chakra-ui/react";
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
import { useWebSocket } from "../../app/utils/use_websocket";
import { v4 as uuid } from "uuid";
import {
  Template,
  useTemplates,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { Button } from "../recipes/button";

const transformInt = (value: number) => {
  return isNaN(value) ? undefined : value;
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

export function GloomhavenCompanionFigureTabContent(props: {
  selectedCampaign: Campaign;
  selectedScenario: Scenario;
}) {
  const { selectedCampaign, selectedScenario } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [figures, setFigures] = useState<Figure[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedFigure, setSelectedFigure] = useState<Figure>();
  const [createFigureRecord] = useState<Figure>({
    id: "",
    parent: "",
    entity: "",
    rank: null,
    class: "",
    name: null,
    number: null,
    maximumHP: 0,
    damage: 0,
    xp: null,
    move: null,
    attack: null,
    innateOffenses: null,
    shield: null,
    innateDefenses: null,
    statuses: null,
    target: null,
    retaliate: null,
    updatedAt: null,
    pierce: null,
    special: null,
  });
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

  const playerClasses = [
    "bruiser",
    "mindthief",
    "silent knife",
    "spellweaver",
    "wildfury",
    "berserker",
    "quartermaster",
    "elementalist",
    "doomstalker",
    "bladeswarm",
    "soothsinger",
    "sawbones",
    "plagueherald",
    "cragheart",
    "tinkerer",
    "sunkeeper",
    "nightshroud",
    "soultether",
  ];

  type Group = {
    class: string;
    figures: Figure[];
  };
  const collectGroups = (figures: Figure[]): Group[] => {
    const groups: { [Property in string]: Group } = {};

    // Any groups listed for the scenario always have a placeholder
    // group card.
    selectedScenario.groups
      .split(",")
      .map((group) => group.trim())
      .sort()
      .forEach((group) => {
        if (!groups[group]) groups[group] = { class: group, figures: [] };
      });

    figures.forEach((figure) => {
      const groupClass = playerClasses.some(
        (playerClass) => playerClass === figure.class.toLocaleLowerCase(),
      )
        ? "Player"
        : figure.class;
      if (!groups[groupClass])
        groups[groupClass] = { class: groupClass, figures: [figure] };
      else groups[groupClass].figures.push(figure);
    });

    Object.keys(groups)
      .sort()
      .forEach(
        (key) =>
          (groups[key].figures = groups[key].figures
            .sort((figureA, figureB) => {
              if (figureA.number === null) return -1;
              if (figureB.number === null) return 1;
              if (figureA.number < figureB.number) return -1;
              else if (figureA.number === figureB.number) return 0;
              else return 1;
            })
            .sort((figureA, figureB) => {
              if (figureA.rank === null) return -1;
              if (figureB.rank === null) return 1;
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
            })
            // Class sorting really only effects the Player group.
            .sort((figureA, figureB) => {
              if (figureA.class < figureB.class) return -1;
              if (figureA.class > figureB.class) return 1;
              else return 0;
            })),
      );

    return Object.keys(groups).map((key) => groups[key]);
  };

  const desiredFieldOrder: { [Property in keyof Figure]?: number } = {
    rank: 0,
    class: 1,
    name: 2,
    number: 3,
    maximumHP: 4,
    damage: 5,
    xp: 6,
    move: 7,
    attack: 8,
    target: 9,
    innateOffenses: 10,
    shield: 11,
    retaliate: 12,
    innateDefenses: 13,
    statuses: 14,
  };

  const groups = collectGroups(figures);

  const addEnemy = (enemyClass: string, rank: "normal" | "elite") => {
    const template: Template | undefined = templates.find(
      (template) => template.class === enemyClass,
    );
    if (template) {
      const group = groups.find((group) => group.class === enemyClass);
      const currentStandeeNumbers = group?.figures.map(
        (figure) => figure.number,
      );
      const standeeNumbers = new Array(template.standeeLimit)
        .fill(0)
        .map((_, index) => index + 1)
        .filter((standeeNumber) => {
          if (currentStandeeNumbers) {
            return !currentStandeeNumbers.some(
              (sNumber) => sNumber === standeeNumber,
            );
          } else {
            return true;
          }
        });
      if (standeeNumbers.length > 0) {
        const standeeNumber =
          standeeNumbers[Math.floor(Math.random() * standeeNumbers.length)];
        const figure: Figure =
          template.stats[selectedScenario.scenarioLevel][rank];
        figure.number = standeeNumber;
        onFigureCreate(figure, true);
      }
    }
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
            omitKeys={["id", "parent", "entity", "updatedAt"]}
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
            desiredFieldOrder={desiredFieldOrder}
            marginLeft={3}
            marginRight={3}
          />
          {groups.map((group, groupIndex) => {
            return (
              <Card.Root
                key={`group-card-${groupIndex}`}
                bg={"bg.emphasized"}
                marginLeft={3}
                marginRight={3}
                overflow="hidden"
              >
                <Card.Body
                  paddingLeft="0"
                  paddingRight="0"
                  paddingTop="4"
                  paddingBottom="2"
                >
                  <Card.Title marginBottom={2} marginLeft={3}>
                    <Stack direction="row" alignItems="center">
                      <Text>{group.class}</Text>
                      {templates.find(
                        (template) => template.class === group.class,
                      ) && (
                        <>
                          <Button
                            marginLeft="auto"
                            variant="safe"
                            minWidth="90px"
                            onClick={() => {
                              addEnemy(group.class, "normal");
                            }}
                          >
                            {"Normal"}
                          </Button>
                          <Button
                            marginRight={3}
                            variant="safe"
                            minWidth="90px"
                            onClick={() => {
                              addEnemy(group.class, "elite");
                            }}
                          >
                            {"Elite"}
                          </Button>
                        </>
                      )}
                    </Stack>
                  </Card.Title>
                  <Grid
                    key={`group-grid-${groupIndex}`}
                    templateColumns={{
                      base: "repeat(1, 1fr)",
                      md: "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                    }}
                    gap="3"
                    marginLeft={3}
                    marginRight={3}
                  >
                    {group.figures.map((figure, figureIndex) => {
                      return (
                        <GridItem
                          colSpan={1}
                          key={`figure-card-${figureIndex}`}
                          justifyItems="center"
                          onClick={() => onFigureSelect(figure)}
                          minWidth={365}
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
