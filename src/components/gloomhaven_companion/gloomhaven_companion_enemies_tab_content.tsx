import { Card, Grid, GridItem, Skeleton, Stack, Text } from "@chakra-ui/react";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { FigureCard } from "../ui/figure_card";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { Button } from "../recipes/button";
import { Group } from "./gloomhaven_companion_allies_enemies_tab_content";
import { RefObject, useCallback, useState } from "react";
import CRUDButtons from "../ui/crud_buttons";
import { number, object, string } from "yup";

export function GloomhavenCompanionEnemyTabContent(props: {
  selectedScenario: Scenario;
  figures: Figure[];
  templates: Template[];
  isLoading: boolean;
  selectedFigure?: Figure;
  onFigureCreate: (figure: Figure, silent?: boolean) => Promise<boolean>;
  onFigureDelete: (figure: Figure, silent?: boolean) => Promise<boolean>;
  onFigureEdit: (figure: Figure, silent?: boolean) => Promise<boolean>;
  onFigureSelect: (figure: Figure, type: string) => void;
  ref: RefObject<HTMLDivElement | null>;
}) {
  const {
    selectedScenario,
    figures,
    templates,
    isLoading,
    selectedFigure,
    onFigureCreate,
    onFigureDelete,
    onFigureEdit,
    onFigureSelect,
    ref,
  } = props;

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
      if (
        !playerClasses.some(
          (playerClass) => playerClass === figure.class.toLocaleLowerCase(),
        )
      ) {
        const groupClass = figure.class;
        if (!groups[groupClass])
          groups[groupClass] = { class: groupClass, figures: [figure] };
        else groups[groupClass].figures.push(figure);
      }
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
  const groups = collectGroups(figures);

  const addEnemy = useCallback(
    (enemyClass: string, rank: "normal" | "elite") => {
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
    },
    [templates, onFigureCreate, groups, selectedScenario],
  );

  // START OF THINGS I HOPE TO CHANGE OR UPGRADE
  // Hopefully a lot of this will be changed, moved or deleted
  // as the templating system gets more advanced.
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
  const crudButtons = () => {
    return (
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
        confirmDelete={false}
      />
    );
  };
  // END OF THINGS I HOPE TO CHANGE OR UPGRADE

  return (
    <>
      {isLoading ? (
        <Stack direction="column" marginLeft={2} marginRight={2}>
          <Skeleton height={50} variant="shine" />
          <Skeleton height={250} variant="shine" />
          <Skeleton height={50} variant="shine" />
        </Stack>
      ) : (
        <Stack gap={3}>
          {crudButtons()}
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
                  paddingLeft={0}
                  paddingRight={0}
                  paddingTop={3}
                  paddingBottom={3}
                >
                  <Card.Title marginBottom={3} marginLeft={3}>
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
                          onClick={() => onFigureSelect(figure, "enemy")}
                          minWidth={365}
                        >
                          <FigureCard
                            figure={figure}
                            selectedFigure={selectedFigure}
                            onFigureCreate={onFigureCreate}
                            onFigureDelete={onFigureDelete}
                            onFigureEdit={onFigureEdit}
                            ref={ref}
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
