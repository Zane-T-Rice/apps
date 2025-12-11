import { Box, Card, Grid, GridItem, Stack, Text } from "@chakra-ui/react";
import { Button } from "../recipes/button";
import { IoCloseSharp } from "react-icons/io5";
import { FigureDataList } from "./figure_data_list";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { GiCurlyWing } from "react-icons/gi";
import EditFigureButton from "./edit_figure_button";

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
          <Grid templateColumns="repeat(10, 1fr)" alignItems="center">
            <GridItem colSpan={8}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Text>{buildTitleText(figure)}</Text>
                {figure.flying && (
                  <Box marginBottom={1}>
                    <GiCurlyWing />
                  </Box>
                )}
              </Stack>
            </GridItem>
            <GridItem colSpan={1}>
              <EditFigureButton
                onFigureEdit={onFigureEdit}
                figure={figure}
                padding={0}
              />
            </GridItem>
            <GridItem colSpan={1} marginLeft="auto">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFigureDelete(figure, true);
                }}
                _hover={{
                  color: "red",
                }}
                disabled={figure.maximumHP > figure.damage}
                padding={0}
              >
                <IoCloseSharp />
              </Button>
            </GridItem>
          </Grid>
        </Card.Title>
        <FigureDataList figure={figure} onFigureEdit={onFigureEdit} />
      </Stack>
    </Card.Body>
  );
}
