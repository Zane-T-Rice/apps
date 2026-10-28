import { Box, Card, Grid, GridItem, Stack, Text } from "@chakra-ui/react";
import { Button } from "../recipes/button";
import { IoCloseSharp } from "react-icons/io5";
import { FigureDataList } from "./figure_data_list";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { GiCurlyWing } from "react-icons/gi";
import { removeAndRefocus } from "@/app/utils/keyboard_select";
import EditFigureButton from "./edit_figure_button";
import { useLongPress } from "@/app/utils/use_long_press";

// How long the X is held to remove a figure.
const REMOVE_HOLD_MS = 800;

export function SelectableFigureCardBody(props: {
  figure: Figure;
  onFigureDelete: (figure: Figure, silent?: boolean) => Promise<boolean>;
  onFigureEdit: (figure: Figure, silent?: boolean) => Promise<boolean>;
}) {
  const { figure, onFigureDelete, onFigureEdit } = props;
  const isDead = figure.maximumHP <= figure.damage;
  // Holding the X removes any figure, which is how one added by accident goes away. From the
  // keyboard that is holding enter or space. A figure that is dead is taken off with a plain press.
  const { pressing, wasLongPress, longPressProps } = useLongPress(
    (target) => removeAndRefocus(target, () => onFigureDelete(figure, true)),
    { ms: REMOVE_HOLD_MS, keyboard: isDead ? false : "hold" },
  );

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
              <Box
                position="relative"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
              >
                {/* Fills up all the way round as the X is held. Letting go early empties it at once. */}
                <svg
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="red"
                    strokeWidth="7"
                    pathLength={100}
                    strokeDasharray={100}
                    strokeDashoffset={pressing ? 0 : 100}
                    transform="rotate(-90 50 50)"
                    style={{
                      transition: pressing
                        ? `stroke-dashoffset ${REMOVE_HOLD_MS}ms linear`
                        : "none",
                    }}
                  />
                </svg>
                <Button
                  aria-label={isDead ? "Remove" : "Remove. Hold to remove"}
                  title={isDead ? "Remove" : "Hold to remove"}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (wasLongPress()) return;
                    // A figure that is dead is taken off with a tap. So is a click with no
                    // pointer or key press behind it, which is assistive technology, since it
                    // can not hold anything. Any other tap does nothing, and the ring while
                    // holding shows what it takes.
                    if (isDead || e.detail === 0)
                      removeAndRefocus(e.currentTarget, () =>
                        onFigureDelete(figure, true),
                      );
                  }}
                  {...longPressProps}
                  color={pressing ? "red" : undefined}
                  _hover={{
                    color: "red",
                  }}
                  padding={0}
                >
                  <IoCloseSharp />
                </Button>
              </Box>
            </GridItem>
          </Grid>
        </Card.Title>
        <FigureDataList figure={figure} onFigureEdit={onFigureEdit} />
      </Stack>
    </Card.Body>
  );
}
