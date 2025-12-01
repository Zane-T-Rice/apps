import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Grid, GridItem, Stack, Text } from "@chakra-ui/react";
import { GiBroadsword, GiLeatherBoot } from "react-icons/gi";
import { IoShield } from "react-icons/io5";
import { IncrementalNumberEditor } from "./incremental_number_editor";
import { StatusSwitch } from "./status_switch";
import { Image } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { FiTarget } from "react-icons/fi";
import { FaHandFist } from "react-icons/fa6";
import { useMemo } from "react";
import { TbBow } from "react-icons/tb";

export function FigureDataList(props: {
  figure: Figure;
  onFigureEdit: (figure: Figure, silent?: boolean) => void;
}) {
  const { figure, onFigureEdit } = props;

  const figureDataList = useMemo(() => {
    const decreaseDamage = (figure: Figure) => {
      figure.damage = figure.damage - 1;
    };

    const increaseDamage = (figure: Figure) => {
      figure.damage = figure.damage + 1;
    };

    const increaseXP = (figure: Figure) => {
      if (figure.xp !== null && figure.xp !== undefined)
        figure.xp = figure.xp + 1;
    };

    const decreaseXP = (figure: Figure) => {
      if (figure.xp !== null && figure.xp !== undefined)
        figure.xp = figure.xp - 1;
    };

    const notNil = (value: string | number | null | undefined) => {
      return value !== null && value !== undefined && value !== "";
    };

    const statusesToIcons = (statuses: string, isImmunity: boolean) => {
      const textStatuses: { [key: string]: string } = {
        attackersgaindisadvantage: "AtkGDis",
        advantage: "Adv",
      };
      return statuses
        .split(",")
        .map((status) => status.trim())
        .map((status, index) => {
          const lowerCaseStatus = status.toLowerCase();
          return (
            <Stack
              direction="row"
              gap="0"
              key={`statuses-${status}-${isImmunity}-${index}`}
            >
              <Tooltip content={status}>
                {!textStatuses[lowerCaseStatus] ? (
                  <Image
                    src={`/apps/${status.toLowerCase()}.png`}
                    width="6"
                    height="6"
                    alt={status}
                  />
                ) : (
                  <Text>{textStatuses[lowerCaseStatus]}</Text>
                )}
              </Tooltip>
            </Stack>
          );
        });
    };

    const columnOneSpan = {
      base: 2,
      smDown: 2,
    };
    const columnTwoSpan = {
      base: 12,
      smDown: 12,
    };
    const totalColumnSpan = {
      base: 14,
    };

    const currentHP = figure.maximumHP - figure.damage;
    const percentHP = currentHP / figure.maximumHP;

    const getHPBar = () => {
      let color = "rgba(0,200,0,1)";
      if (percentHP < 0.75) color = "rgba(200,200,0,1)";
      if (percentHP < 0.5) color = "rgba(200,0,0,1)";
      return `linear-gradient(to right, transparent ${50 * (1 - percentHP)}%, ${color} 50%, transparent ${50 * percentHP + 50}%)`;
    };

    return figure ? (
      <Grid templateColumns="repeat(14, 1fr)" gapX={2} gapY={1}>
        <GridItem colSpan={columnOneSpan} alignContent={"center"}>
          <Text minWidth="1/12">{"HP"}</Text>
        </GridItem>
        <GridItem colSpan={columnTwoSpan}>
          <IncrementalNumberEditor
            increaseCallback={() => {
              decreaseDamage(figure);
              onFigureEdit(figure, true);
            }}
            decreaseCallback={() => {
              increaseDamage(figure);
              onFigureEdit(figure, true);
            }}
            text={`${currentHP} / ${figure.maximumHP}`}
            bg={getHPBar()}
          />
        </GridItem>
        {notNil(figure.xp) && (
          <>
            <GridItem colSpan={columnOneSpan}>
              <Text minWidth="1/12">{"XP"}</Text>
            </GridItem>
            <GridItem colSpan={columnTwoSpan}>
              <IncrementalNumberEditor
                increaseCallback={() => {
                  increaseXP(figure);
                  onFigureEdit(figure, true);
                }}
                decreaseCallback={() => {
                  decreaseXP(figure);
                  onFigureEdit(figure, true);
                }}
                text={`${figure.xp}`}
              />
            </GridItem>
          </>
        )}
        <GridItem colSpan={totalColumnSpan}>
          <Stack gapY="1">
            <Stack direction="row" alignItems={"center"} gapX="2">
              {notNil(figure.move) && <GiLeatherBoot />}
              {notNil(figure.move) && figure.move}
              {notNil(figure.attack) && <GiBroadsword />}
              {notNil(figure.attack) && figure.attack}
              {figure.innateOffenses &&
                notNil(figure.innateOffenses) &&
                statusesToIcons(figure.innateOffenses, false)}
              {notNil(figure.range) && <TbBow />}
              {notNil(figure.range) && figure.range}
              {notNil(figure.target) && <FiTarget />}
              {notNil(figure.target) && figure.target}
              {notNil(figure.pierce) && (
                <Tooltip content={"Pierce"}>
                  <Image
                    src={"/apps/pierce.png"}
                    width="6"
                    height="6"
                    alt={"pierce"}
                  />
                </Tooltip>
              )}
              {notNil(figure.pierce) && figure.pierce}
              {(notNil(figure.move) ||
                notNil(figure.attack) ||
                notNil(figure.innateOffenses)) &&
                (notNil(figure.shield) ||
                  notNil(figure.retaliate) ||
                  notNil(figure.innateDefenses)) && <Text>{"--"}</Text>}
              {(notNil(figure.shield) || notNil(figure.innateDefenses)) && (
                <IoShield />
              )}
              {(notNil(figure.shield) || notNil(figure.innateDefenses)) &&
                (figure.shield || 0)}
              {notNil(figure.retaliate) && <FaHandFist />}
              {notNil(figure.retaliate) && figure.retaliate}
              {figure.innateDefenses &&
                notNil(figure.innateDefenses) &&
                statusesToIcons(figure.innateDefenses, true)}
            </Stack>
            {figure.special &&
              figure.special.split("|").map((special, index) => {
                return <Text key={special + "-" + index}>{special}</Text>;
              })}
          </Stack>
        </GridItem>
        <GridItem rowSpan={1} colSpan={totalColumnSpan}>
          <Stack direction="row" gapX="0">
            {[
              "Strengthen",
              "Invisible",
              "Ward",
              "Safeguard",
              "Immobilize",
              "Muddle",
              "Disarm",
              "Poison",
              "Wound",
              "Stun",
            ].map((status) => {
              return (
                <StatusSwitch
                  key={`status-switch-${figure.id}-${status}`}
                  figure={figure}
                  onFigureEdit={onFigureEdit}
                  status={status}
                />
              );
            })}
          </Stack>
        </GridItem>
      </Grid>
    ) : null;
  }, [figure, onFigureEdit]);
  return figureDataList;
}
