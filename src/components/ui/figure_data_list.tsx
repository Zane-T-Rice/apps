import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Center, DataList, Stack } from "@chakra-ui/react";
import { Button } from "../recipes/button";

export function FigureDataList(props: { figure: Figure, onFigureEdit: (figure: Figure) => void }) {
  const { figure, onFigureEdit } = props;

  const decreaseDamage = (figure: Figure) => {
    figure.damage = figure.damage - 1;
  };

  const increaseDamage = (figure: Figure) => {
    figure.damage = figure.damage + 1;
  };

  return figure ? (
    <>
      <DataList.Root orientation="horizontal" variant="bold">
        <DataList.Item key={"HP"}>
          <Stack direction="row" alignItems="center" flex="auto">
            <DataList.ItemLabel minWidth="1/6">{"HP"}</DataList.ItemLabel>
            <Button minWidth="1/12" height="1/2" variant={"safe"} onClick={() => {
              increaseDamage(figure);
              onFigureEdit(figure);
            }}>-</Button>
            <Center minWidth="1/6">
              {`${figure.maximumHP - figure.damage} / ${figure.maximumHP}`}
            </Center>
            <Button minWidth="1/12" height="1/2" variant={"safe"} onClick={() => {
              decreaseDamage(figure)
              onFigureEdit(figure)
            }}>+</Button>
          </Stack>
        </DataList.Item>
      </DataList.Root >
    </>
  ) : null;
}
