import { Card, Grid, GridItem, Skeleton, Stack, Text } from "@chakra-ui/react";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { FigureCard } from "../ui/figure_card";
import { Group } from "./gloomhaven_companion_allies_enemies_tab_content";
import { RefObject, useCallback } from "react";
import AddPlayerButton from "../ui/add_player_button";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import AddSummonButton from "../ui/add_summon_button";
import AddMonsterButton from "../ui/add_monster_button";
import AddNPCButton from "../ui/add_npc_button";
import { getStandeeNumber } from "@/app/utils/gloomhaven_companion_ui/get_standee_number";

export function GloomhavenCompanionAllyTabContent(props: {
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
    figures,
    templates,
    isLoading,
    selectedFigure,
    onFigureCreate: _onFigureCreate,
    onFigureDelete,
    onFigureEdit,
    onFigureSelect,
    ref,
  } = props;

  const collectGroups = (figures: Figure[]): Group[] => {
    const groups: { [Property in string]: Group } = {};

    figures.forEach((figure) => {
      if (figure.alignment === "ally") {
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
          (groups[key].figures = groups[key].figures.sort(
            (figureA, figureB) => {
              if (figureA.number === null) return 1;
              if (figureB.number === null) return -1;
              if (figureA.number < figureB.number) return -1;
              if (figureA.number > figureB.number) return 1;
              else return 0;
            },
          )),
      );

    return Object.keys(groups)
      .map((key) => groups[key])
      .sort((a, b) => {
        if (a.class > b.class) return 1;
        if (a.class < b.class) return -1;
        return 0;
      });
  };
  const groups = collectGroups(figures);

  const onFigureCreate = useCallback(
    async (figure: Figure, silent?: boolean): Promise<boolean> => {
      const standeeNumber = getStandeeNumber(figure, groups, templates);
      if (standeeNumber === -1) return false;
      if (standeeNumber !== null) figure.number = standeeNumber;
      return _onFigureCreate(figure, silent);
    },
    [_onFigureCreate, groups, templates],
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
              base: "repeat(8, 1fr)",
            }}
            gap="3"
            marginLeft={3}
            marginRight={3}
          >
            <GridItem colSpan={4}>
              <AddPlayerButton
                onCreate={onFigureCreate}
                templates={templates}
              />
            </GridItem>
            <GridItem colSpan={4}>
              <AddSummonButton
                onCreate={onFigureCreate}
                templates={templates}
              />
            </GridItem>
            <GridItem colSpan={4}>
              <AddNPCButton onCreate={onFigureCreate} alignment="ally" />
            </GridItem>
            <GridItem colSpan={4}>
              <AddMonsterButton
                onCreate={onFigureCreate}
                templates={templates}
                alignment="ally"
              />
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
                          onClick={() => onFigureSelect(figure, "ally")}
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
