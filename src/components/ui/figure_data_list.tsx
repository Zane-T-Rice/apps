import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { DataList, Stack, Text } from "@chakra-ui/react";
import { GiBroadsword, GiLeatherBoot } from "react-icons/gi";
import { IoShield } from "react-icons/io5";
import { IncrementalNumberEditor } from "./incremental_number_editor";
import { StatusSwitch } from "./status_switch";
import { Image } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";

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
    figure.number = figure.number + 1;
  };

  const decreaseNumber = (figure: Figure) => {
    figure.number = figure.number - 1;
  };

  const increaseXP = (figure: Figure) => {
    figure.xp = figure.xp + 1;
  };

  const decreaseXP = (figure: Figure) => {
    figure.xp = figure.xp - 1;
  };

  const notNil = (value: string | number) => {
    return value !== null && value !== undefined && value !== "";
  };

  const statusesToIcons = (statuses: string) => {
    return statuses.split(",").map((status, index) => {
      return (
        <Tooltip content={status} key={`innate-defences-${index}`}>
          <Image
            src={`${status.toLowerCase()}.png`}
            width="5"
            height="5"
            alt={status}
          />
        </Tooltip>
      );
    });
  };

  return figure ? (
    <>
      <DataList.Root orientation="horizontal" variant="bold">
        <Stack>
          {notNil(figure.number) && (
            <DataList.Item key={"#"}>
              <Stack direction="row" alignItems="center" flex="auto">
                <DataList.ItemLabel minWidth="1/6">{"#"}</DataList.ItemLabel>
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
            </DataList.Item>
          )}
          <DataList.Item key={"HP"}>
            <Stack direction="row" alignItems="center" flex="auto">
              <DataList.ItemLabel minWidth="1/6">{"HP"}</DataList.ItemLabel>
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
          </DataList.Item>
          {notNil(figure.xp) && (
            <DataList.Item key={"XP"}>
              <Stack direction="row" alignItems="center" flex="auto">
                <DataList.ItemLabel minWidth="1/6">{"XP"}</DataList.ItemLabel>
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
            </DataList.Item>
          )}
          <Stack direction="row" alignItems={"center"} gapX="2">
            {notNil(figure.move) && <GiLeatherBoot />}
            {notNil(figure.move) && figure.move}
            {notNil(figure.attack) && <GiBroadsword />}
            {notNil(figure.attack) && figure.attack}
            {notNil(figure.innateOffenses) &&
              statusesToIcons(figure.innateOffenses)}
            {notNil(figure.shield) && <IoShield />}
            {notNil(figure.shield) && figure.shield}
            <Text>Immune:</Text>
            {notNil(figure.innateDefenses) &&
              statusesToIcons(figure.innateDefenses)}
          </Stack>
          <Stack direction="column" gapY="2">
            <Stack direction="row" gapX="2">
              {["Strengthen", "Invisible", "Ward", "Safeguard"].map(
                (status) => {
                  return (
                    <StatusSwitch
                      key={`status-switch-${figure.id}-${status}`}
                      figure={figure}
                      onFigureEdit={onFigureEdit}
                      status={status}
                      isPositive={true}
                    />
                  );
                },
              )}
            </Stack>
            <Stack direction="row" gapX="2">
              {[
                "Stun",
                "Immobilize",
                "Muddle",
                "Disarm",
                "Poison",
                "Wound",
              ].map((status) => {
                return (
                  <StatusSwitch
                    key={`status-switch-${figure.id}-${status}`}
                    figure={figure}
                    onFigureEdit={onFigureEdit}
                    status={status}
                    isPositive={false}
                  />
                );
              })}
            </Stack>
          </Stack>
        </Stack>
      </DataList.Root>
    </>
  ) : null;
}
