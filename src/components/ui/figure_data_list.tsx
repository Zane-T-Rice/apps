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

export function FigureDataList(props: {
  figure: Figure;
  onFigureEdit: (figure: Figure, onlyShowErrors?: boolean) => void;
}) {
  const { figure, onFigureEdit } = props;

  const decreaseDamage = (figure: Figure) => {
    figure.damage = figure.damage - 1;
  };

  const increaseDamage = (figure: Figure) => {
    figure.damage = figure.damage + 1;
  };

  const increaseNumber = (figure: Figure) => {
    if (figure.number !== null) figure.number = figure.number + 1;
  };

  const decreaseNumber = (figure: Figure) => {
    if (figure.number !== null) figure.number = figure.number - 1;
  };

  const increaseXP = (figure: Figure) => {
    if (figure.xp !== null) figure.xp = figure.xp + 1;
  };

  const decreaseXP = (figure: Figure) => {
    if (figure.xp !== null) figure.xp = figure.xp - 1;
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
                  src={`${status.toLowerCase()}.png`}
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
    base: 1,
    smDown: 2,
  };
  const columnTwoSpan = {
    base: 6,
    smDown: 9,
  };
  const columnThreeSpan = {
    base: 7,
    smDown: 3,
  };
  const totalColumnSpan = {
    base: 14,
  };

  return figure ? (
    <Grid templateColumns="repeat(14, 1fr)" gapX={2} gapY={1}>
      {notNil(figure.number) && (
        <>
          <GridItem colSpan={columnOneSpan}>
            <Text>{"#"}</Text>
          </GridItem>
          <GridItem colSpan={columnTwoSpan}>
            <Stack direction="row" alignItems="center">
              <IncrementalNumberEditor
                increaseCallback={() => {
                  increaseNumber(figure);
                  onFigureEdit(figure, true);
                }}
                decreaseCallback={() => {
                  decreaseNumber(figure);
                  onFigureEdit(figure, true);
                }}
                text={`${figure.number}`}
              />
            </Stack>
          </GridItem>
          <GridItem colSpan={columnThreeSpan}></GridItem>
        </>
      )}
      <GridItem colSpan={columnOneSpan}>
        <Text minWidth="1/12">{"HP"}</Text>
      </GridItem>
      <GridItem colSpan={columnTwoSpan}>
        <Stack direction="row" alignItems={"center"}>
          <IncrementalNumberEditor
            increaseCallback={() => {
              decreaseDamage(figure);
              onFigureEdit(figure, true);
            }}
            decreaseCallback={() => {
              increaseDamage(figure);
              onFigureEdit(figure, true);
            }}
            text={`${figure.maximumHP - figure.damage} / ${figure.maximumHP}`}
          />
        </Stack>
      </GridItem>
      <GridItem colSpan={columnThreeSpan}></GridItem>
      {notNil(figure.xp) && (
        <>
          <GridItem colSpan={columnOneSpan}>
            <Text minWidth="1/12">{"XP"}</Text>
          </GridItem>
          <GridItem colSpan={columnTwoSpan}>
            <Stack direction="row" alignItems="center">
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
            </Stack>
          </GridItem>
          <GridItem colSpan={columnThreeSpan}></GridItem>
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
            {notNil(figure.target) && <FiTarget />}
            {notNil(figure.target) && figure.target}
            {notNil(figure.pierce) && (
              <Tooltip content={"Pierce"}>
                <Image src={"pierce.png"} width="6" height="6" alt={"pierce"} />
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
}
