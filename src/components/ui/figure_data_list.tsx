import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Collapsible, DataList, Stack, Text } from "@chakra-ui/react";
import { GiBroadsword, GiLeatherBoot } from "react-icons/gi";
import { IoShield } from "react-icons/io5";
import { IncrementalNumberEditor } from "./incremental_number_editor";
import { StatusSwitch } from "./status_switch";
import { LuChevronRight } from "react-icons/lu";
import { useState } from "react";

export function FigureDataList(props: {
  figure: Figure;
  onFigureEdit: (figure: Figure, onlyShowErrors?: boolean) => void;
}) {
  const { figure, onFigureEdit } = props;
  const [statusesOpen, setStatusesOpen] = useState<boolean>(false);

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
            {notNil(figure.attack) && figure.attack}{" "}
            {notNil(figure.innateOffenses) && figure.innateOffenses}
            {notNil(figure.shield) && <IoShield />}
            {notNil(figure.shield) && figure.shield}
            {notNil(figure.innateDefenses) && (
              <>
                {"  "}
                <Text fontSize="sm">Immune:</Text>{" "}
                <Text fontSize="sm">{figure.innateDefenses}</Text>
              </>
            )}
            <Collapsible.Root
              onClick={() => {
                setStatusesOpen(!statusesOpen);
              }}
            >
              <Collapsible.Trigger display="flex" alignItems="center">
                <Collapsible.Indicator
                  transition="transform 0.2s"
                  _open={{ transform: "rotate(90deg)" }}
                >
                  <LuChevronRight />
                </Collapsible.Indicator>
                Statuses
              </Collapsible.Trigger>
            </Collapsible.Root>
          </Stack>
          <Collapsible.Root open={statusesOpen}>
            <Collapsible.Content>
              <Stack direction="row" gapX="5">
                <Stack direction="column">
                  {["Strengthen", "Invisible", "Ward"].map((status) => {
                    return (
                      <StatusSwitch
                        key={`status-switch-${figure.id}-${status}`}
                        figure={figure}
                        onFigureEdit={onFigureEdit}
                        status={status}
                        isPositive={true}
                      />
                    );
                  })}
                </Stack>
                <Stack direction="column">
                  {["Stun", "Immobilize", "Muddle"].map((status) => {
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
                <Stack direction="column">
                  {["Disarm", "Poison", "Wound"].map((status) => {
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
            </Collapsible.Content>
          </Collapsible.Root>
        </Stack>
      </DataList.Root>
    </>
  ) : null;
}
