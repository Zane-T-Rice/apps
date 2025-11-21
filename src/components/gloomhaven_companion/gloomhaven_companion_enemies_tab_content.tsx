import { Card, Grid, GridItem, Skeleton, Stack, Text } from "@chakra-ui/react";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { FigureCard } from "../ui/figure_card";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { Button } from "../recipes/button";
import { Group } from "./gloomhaven_companion_allies_enemies_tab_content";
import { RefObject, useCallback } from "react";
import AddMonsterButton from "../ui/add_monster_button";
import { getStandeeNumber } from "@/app/utils/gloomhaven_companion_ui/get_standee_number";
import AddNPCButton from "../ui/add_npc_button";

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
      if (figure.alignment === "enemy") {
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
            })),
      );

    return Object.keys(groups).map((key) => groups[key]);
  };
  const groups = collectGroups(figures);

  const addEnemy = useCallback(
    (enemyClass: string, rank: "normal" | "elite") => {
      const template: Template | undefined = templates.find(
        (template) => template.class.toLowerCase() === enemyClass.toLowerCase(),
      );
      if (template) {
        const figure: Figure | undefined =
          template.stats[selectedScenario.scenarioLevel][rank];
        if (figure) {
          const standeeNumber = getStandeeNumber(figure, groups, templates);
          if (standeeNumber !== -1) {
            figure.alignment = "enemy";
            figure.number = standeeNumber;
            onFigureCreate(figure, true);
          }
        }
      }
    },
    [templates, onFigureCreate, groups, selectedScenario],
  );

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
          <Grid
            key={`add-buttons`}
            templateColumns={{
              base: "repeat(6, 1fr)",
            }}
            gap="3"
            marginLeft={3}
            marginRight={3}
          >
            <GridItem colSpan={3}>
              <AddMonsterButton
                onCreate={onFigureCreate}
                templates={templates}
                alignment="enemy"
              />
            </GridItem>
            <GridItem colSpan={3}>
              <AddNPCButton onCreate={onFigureCreate} alignment="enemy" />
            </GridItem>
          </Grid>
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
