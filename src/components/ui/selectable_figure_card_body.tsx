import { Box, Card, Stack, Text } from "@chakra-ui/react";
import { Button } from "../recipes/button";
import { IoCloseSharp } from "react-icons/io5";
import { FigureDataList } from "./figure_data_list";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { GiCurlyWing } from "react-icons/gi";

export function SelectableFigureCardBody(props: {
  figure: Figure;
  onFigureDelete: (figure: Figure, silent?: boolean) => Promise<boolean>;
  onFigureEdit: (figure: Figure, silent?: boolean) => Promise<boolean>;
}) {
  const { figure, onFigureDelete, onFigureEdit } = props;

  const buildTitleText = (figure: Figure) => {
    let title = "";
    if (figure.rank?.toLowerCase() === "character") {
      title = [figure.class, figure.name].filter((e) => !!e).join(" ");
    } else if (figure.rank?.toLowerCase() === "summon") {
      title = [figure.name].filter((e) => !!e).join(" ");
    } else if (figure.class?.toLowerCase() === "npc / obstacle") {
      title = [figure.name].filter((e) => !!e).join(" ");
    } else {
      title = [figure.rank, figure.class, figure.name, figure.number]
        .filter((e) => !!e)
        .join(" ");
    }
    return title;
  };

  return (
    <Card.Body
      paddingTop="0px"
      paddingLeft="6px"
      paddingBottom="12px"
      paddingRight="6px"
    >
      <Stack gap={0}>
        <Card.Title>
          <Stack direction="row" alignItems="center" gap="1">
            <Text>{buildTitleText(figure)}</Text>
            {figure.flying && (
              <Box marginBottom={1}>
                <GiCurlyWing />
              </Box>
            )}
            <Button
              marginLeft="auto"
              onClick={() => onFigureDelete(figure, true)}
              _hover={{
                color: "red",
              }}
              // disabled={figure.maximumHP > figure.damage}
            >
              <IoCloseSharp />
            </Button>
          </Stack>
        </Card.Title>
        <FigureDataList figure={figure} onFigureEdit={onFigureEdit} />
      </Stack>
    </Card.Body>
  );
}
