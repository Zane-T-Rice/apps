import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { DataList, Stack } from "@chakra-ui/react";
import { GiBroadsword, GiLeatherBoot } from "react-icons/gi";
import { IoShield } from "react-icons/io5";
import { IncrementalNumberEditor } from "./incremental_number_editor";

export function FigureDataList(props: { figure: Figure, onFigureEdit: (figure: Figure) => void }) {
  const { figure, onFigureEdit } = props;

  const decreaseDamage = (figure: Figure) => {
    figure.damage = figure.damage - 1;
  };

  const increaseDamage = (figure: Figure) => {
    figure.damage = figure.damage + 1;
  };

  const increaseNumber = (figure: Figure) => {
    figure.number = figure.number + 1;
  }

  const decreaseNumber = (figure: Figure) => {
    figure.number = figure.number - 1;
  }

  return figure ? (
    <>
      <DataList.Root orientation="horizontal" variant="bold">
        <Stack>
          <DataList.Item key={"#"}>
            <Stack direction="row" alignItems="center" flex="auto">
              <DataList.ItemLabel minWidth="1/6">{"#"}</DataList.ItemLabel>
              <IncrementalNumberEditor
                increaseCallback={() => {
                  increaseNumber(figure);
                  onFigureEdit(figure);
                }}
                decreaseCallback={() => {
                  decreaseNumber(figure)
                  onFigureEdit(figure)
                }}
                text={`${figure.number}`}
              />
            </Stack>
          </DataList.Item>
          <DataList.Item key={"HP"}>
            <Stack direction="row" alignItems="center" flex="auto">
              <DataList.ItemLabel minWidth="1/6">{"HP"}</DataList.ItemLabel>
              <IncrementalNumberEditor
                increaseCallback={() => {
                  decreaseDamage(figure);
                  onFigureEdit(figure);
                }}
                decreaseCallback={() => {
                  increaseDamage(figure)
                  onFigureEdit(figure)
                }}
                text={`${figure.maximumHP - figure.damage} / ${figure.maximumHP}`}
              />
            </Stack>
          </DataList.Item>
          <Stack direction="row" alignItems={"center"} gapX="2"><GiLeatherBoot />{figure.move}<GiBroadsword />{figure.attack}<IoShield />{figure.shield}</Stack>
        </Stack>
      </DataList.Root >
    </>
  ) : null;
}
