import { Card, Stack } from "@chakra-ui/react";
import { SelectableCardRoot } from "./selectable_card_root";
import { Button } from "../recipes/button";
import { FaRegClone } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { FigureDataList } from "./figure_data_list";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";

export function FigureCard(props: {
  figure: Figure;
  selectedFigure: Figure | undefined;
  onFigureCreate: (
    figure: Figure,
    showOnlyErrors?: boolean,
  ) => Promise<boolean>;
  onFigureDelete: (figure: Figure) => Promise<boolean>;
  onFigureEdit: (figure: Figure, onlyShowErrors?: boolean) => Promise<boolean>;
}) {
  const {
    figure,
    selectedFigure,
    onFigureCreate,
    onFigureDelete,
    onFigureEdit,
  } = props;

  const buildTitleText = (figure: Figure) => {
    return `${figure.rank} ${figure.class} ${figure.name}`;
  };

  return (
    <SelectableCardRoot resource={figure} selectedResource={selectedFigure}>
      <Card.Body
        paddingTop="0px"
        paddingLeft="6px"
        paddingBottom="12px"
        paddingRight="6px"
        _hover={{
          bg: figure.id !== selectedFigure?.id ? "bg.subtle" : "unset",
        }}
      >
        <Stack gap={0}>
          <Card.Title>
            <Stack direction="row" alignItems="center" gap="0">
              {buildTitleText(figure)}
              <Button
                paddingLeft="1"
                paddingBottom="2"
                borderWidth="0"
                onClick={() => onFigureCreate(figure)}
                _hover={{
                  color: "green",
                }}
              >
                <FaRegClone />
              </Button>
              <Button
                marginLeft="auto"
                onClick={() => onFigureDelete(figure)}
                _hover={{
                  color: "red",
                }}
              >
                <IoCloseSharp />
              </Button>
            </Stack>
          </Card.Title>
          <FigureDataList figure={figure} onFigureEdit={onFigureEdit} />
        </Stack>
      </Card.Body>
    </SelectableCardRoot>
  );
}
