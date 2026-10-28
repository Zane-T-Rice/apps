import { Box, Stack, Text } from "@chakra-ui/react";
import { ComponentType, useEffect, useRef } from "react";
import {
  GiFlame,
  GiMoon,
  GiSnowflake2,
  GiStoneBlock,
  GiSun,
  GiTornado,
} from "react-icons/gi";
import { Button } from "../recipes/button";
import { useLongPress } from "@/app/utils/use_long_press";
import { AlertDialog } from "./alert_dialog";
import { toaster } from "./toaster";
import {
  Element,
  ELEMENTS,
  elementKey,
  ElementState,
  getElementState,
  buildTurnList,
  DEFER_PREFIX,
  INITIATIVE_PREFIX,
  ORDER_PREFIX,
  planTieTap,
  SECOND_INITIATIVE_PREFIX,
  doneKey,
  EXTRA_PREFIX,
  getRound,
  hasRoundStarted,
  ROUND_KEY,
  STARTED_KEY,
  TurnGroup,
} from "@/app/utils/gloomhaven_companion_ui/table_state";
import { SaveState } from "@/app/utils/gloomhaven_companion_ui/use_table_state";

const ELEMENT_ICONS: Record<Element, ComponentType> = {
  fire: GiFlame,
  ice: GiSnowflake2,
  air: GiTornado,
  earth: GiStoneBlock,
  light: GiSun,
  dark: GiMoon,
};

const ELEMENT_COLORS: Record<Element, string> = {
  fire: "red",
  ice: "blue",
  air: "gray",
  earth: "green",
  light: "yellow",
  dark: "purple",
};

function ElementButton(props: {
  element: Element;
  elementState: ElementState;
  onClick: () => void;
  onLongPress: () => void;
}) {
  const { element, elementState, onClick, onLongPress } = props;
  const { wasLongPress, longPressProps } = useLongPress(onLongPress);
  const Icon = ELEMENT_ICONS[element];
  const color = ELEMENT_COLORS[element];
  return (
    <Button
      aria-label={`${element} is ${elementState}`}
      aria-pressed={elementState !== "inert"}
      onClick={() => {
        if (!wasLongPress()) onClick();
      }}
      {...longPressProps}
      variant="outline"
      colorPalette={color}
      flex={1}
      minWidth={0}
      paddingX={0}
      height={12}
      fontSize="2xl"
      bg={elementState === "strong" ? `${color}.solid` : undefined}
      color={elementState === "strong" ? `${color}.contrast` : undefined}
      opacity={elementState === "inert" ? 0.4 : 1}
      borderStyle={elementState === "waning" ? "dashed" : "solid"}
      borderWidth={elementState === "waning" ? "3px" : "1px"}
    >
      <Icon />
    </Button>
  );
}

// The round, the elements and the turn order for everyone at the table.
export function TableStatus(props: {
  state: Record<string, string>;
  turnGroups: TurnGroup[];
  saveState: SaveState;
}) {
  const { state, turnGroups, saveState } = props;

  const round = getRound(state);
  const turns = buildTurnList(turnGroups, state);
  const waitingOn = turnGroups.filter(
    (group) => !turns.some((turn) => turn.groupKey === group.key),
  );
  const started = hasRoundStarted(turnGroups, turns, state);
  // The first turn that has not happened. A skipped or spawned turn is always earlier than the
  // ones that are still to come, so it is picked up here without anyone stepping through the order.
  const activeIndex = turns.findIndex((turn) => !turn.done);
  const lastDoneIndex = turns.map((turn) => turn.done).lastIndexOf(true);
  const turnName = (turn: (typeof turns)[number]) =>
    turn.spawned ? `${turn.label} ${turn.numbers.join(", ")}` : turn.label;
  // Why a turn is where it is, when that is not just its initiative.
  const turnTag = (turn: (typeof turns)[number], index: number) => {
    const after = turns.find((other) => other.id === turn.afterId);
    if (turn.spawned || turn.late)
      return `${turn.spawned ? "Spawned" : "Late"}${after ? ` after ${turnName(after)}` : ""}`;
    if (turn.tied) return turn.tieRank ? `Tie ${turn.tieRank}` : "Tie";
    // Still to go, but something after it has gone already.
    if (!turn.done && turns.some((other, i) => i > index && other.done))
      return "Missed";
    return null;
  };

  // Keep the current turn in view, since the strip scrolls sideways when there are many turns.
  // Only the strip is scrolled, and only when the turn changes, never the page.
  const strip = useRef<HTMLDivElement>(null);
  const activeChip = useRef<HTMLButtonElement>(null);
  const activeTurnId = turns[activeIndex]?.id;
  useEffect(() => {
    const chip = activeChip.current;
    if (!started || !strip.current || !chip) return;
    strip.current.scrollTo({
      left:
        chip.offsetLeft - (strip.current.clientWidth - chip.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [activeTurnId, started]);

  // A tap infuses an inert element and consumes an available one.
  const onElementClick = (element: Element) => {
    saveState([
      [
        elementKey(element),
        getElementState(state, element) === "inert" ? "strong" : "inert",
      ],
    ]);
  };

  // Holding is the only way to make an element waning by hand.
  const onElementLongPress = (element: Element) => {
    if (getElementState(state, element) !== "waning")
      saveState([[elementKey(element), "waning"]]);
  };

  const onDone = () => {
    if (activeIndex !== -1) saveState([[doneKey(turns[activeIndex].id), "1"]]);
  };

  // Goes back one turn, for when someone was skipped by accident.
  const onBack = () => {
    if (lastDoneIndex !== -1)
      saveState([[doneKey(turns[lastDoneIndex].id), ""]]);
  };

  // A spawned enemy that was added by mistake, or should not act.
  const onRemoveSpawn = (id: string) => {
    saveState([
      [id, ""],
      [doneKey(id), ""],
    ]);
  };

  const onEndRound = () => {
    const entries: [string, string][] = [[ROUND_KEY, `${round + 1}`]];
    const changes: string[] = [];
    ELEMENTS.forEach((element) => {
      const elementState = getElementState(state, element);
      if (elementState === "strong") {
        entries.push([elementKey(element), "waning"]);
        changes.push(`${element} is waning`);
      } else if (elementState === "waning") {
        entries.push([elementKey(element), "inert"]);
        changes.push(`${element} is inert`);
      }
    });
    // Start the next round with no initiatives, no turns taken and no spawns. Initiatives go even
    // for groups with no figures, so they do not come back with the old one.

    Object.keys(state).forEach((key) => {
      if (
        state[key] &&
        (key === STARTED_KEY ||
          key.startsWith(INITIATIVE_PREFIX) ||
          key.startsWith(doneKey("")) ||
          key.startsWith(EXTRA_PREFIX) ||
          key.startsWith(DEFER_PREFIX) ||
          key.startsWith(ORDER_PREFIX) ||
          key.startsWith(SECOND_INITIATIVE_PREFIX))
      )
        entries.push([key, ""]);
    });
    saveState(entries);
    toaster.create({
      title: `Round ${round + 1}`,
      description: changes.length
        ? `${changes.join(", ")}.`
        : "No elements to age.",
      type: "info",
    });
  };

  return (
    <Stack
      gap={2}
      paddingX={3}
      paddingTop={1}
      paddingBottom={3}
      marginBottom={3}
      // Stays in view just below the navigation bar while the cards scroll underneath.
      position="sticky"
      top="var(--navigation-bar-height, 0px)"
      zIndex={998}
      bg={{ base: "white", _dark: "black" }}
      borderBottomWidth="1px"
    >
      <Stack direction="row" alignItems="center">
        <Text fontSize="xl" fontWeight="bold">
          Round {round}
        </Text>
        <AlertDialog
          trigger={
            <Button variant="safe" marginLeft="auto">
              End Round
            </Button>
          }
          titleText={`End round ${round}?`}
          body={
            <Text>
              Strong elements wane, waning elements go inert, and
              everyone&apos;s initiative is cleared.
            </Text>
          }
          confirmText="End Round"
          confirmVariant="safe"
          onConfirm={onEndRound}
        />
      </Stack>
      <Stack direction="row" gap={2}>
        {ELEMENTS.map((element) => (
          <ElementButton
            key={element}
            element={element}
            elementState={getElementState(state, element)}
            onClick={() => onElementClick(element)}
            onLongPress={() => onElementLongPress(element)}
          />
        ))}
      </Stack>
      {(turns.length > 0 || waitingOn.length > 0) && (
        <Stack direction="row" gap={2} alignItems="center">
          <Stack
            ref={strip}
            flex={1}
            minWidth={0}
            direction="row"
            gap={2}
            alignItems="center"
            overflowX="auto"
            // So the chips measure their position from the strip.
            position="relative"
          >
            {turns.map((turn, index) => {
              const tag = turnTag(turn, index);
              return (
                <Stack key={turn.id} direction="row" gap={0} flexShrink={0}>
                  <Button
                    ref={index === activeIndex ? activeChip : undefined}
                    variant={
                      index === activeIndex && started ? "safe" : "outline"
                    }
                    colorPalette={turn.alignment === "ally" ? "blue" : "red"}
                    opacity={turn.done ? 0.4 : 1}
                    // A turn that is over can be tapped to bring it back, and so can groups tied,
                    // to put them in the order they go.
                    pointerEvents={turn.done || turn.tied ? "auto" : "none"}
                    tabIndex={turn.done || turn.tied ? 0 : -1}
                    aria-label={
                      turn.done
                        ? `Bring back ${turn.label}'s turn`
                        : turn.tied
                          ? turn.tieRank
                            ? `Tied, place ${turn.tieRank}. Tap to start the tie over`
                            : `Tied. Tap in the order they go, ${turn.label} next`
                          : undefined
                    }
                    onClick={() => {
                      if (turn.done) saveState([[doneKey(turn.id), ""]]);
                      else {
                        const placed = planTieTap(turns, state, turn.id);
                        if (placed.length > 0) saveState(placed);
                      }
                    }}
                  >
                    {turn.done && "✓ "}
                    {turn.spawned
                      ? turnName(turn)
                      : `${turn.initiative} ${turn.label}`}
                    {tag && (
                      <Text as="span" fontSize="xs" marginLeft={1}>
                        {tag}
                      </Text>
                    )}
                  </Button>
                  {turn.spawned && !turn.done && (
                    <Button
                      variant="outline"
                      colorPalette="red"
                      paddingX={2}
                      minWidth={0}
                      aria-label={`Remove ${turn.label}'s spawned turn`}
                      onClick={() => onRemoveSpawn(turn.id)}
                    >
                      ×
                    </Button>
                  )}
                </Stack>
              );
            })}
            {turns.some((turn) => turn.tied && !turn.tieChosen) && (
              <Box flexShrink={0}>
                <Text color="fg.muted">
                  Tied. Tap them in the order they go.
                </Text>
              </Box>
            )}
            {waitingOn.length > 0 && (
              <Box flexShrink={0}>
                <Text color="fg.muted">
                  Waiting on {waitingOn.map((group) => group.label).join(", ")}
                </Text>
              </Box>
            )}
          </Stack>
          {started && turns.length > 0 && (
            <>
              {lastDoneIndex !== -1 && (
                <Button variant="outline" flexShrink={0} onClick={onBack}>
                  Back
                </Button>
              )}
              {activeIndex !== -1 ? (
                <Button variant="caution" flexShrink={0} onClick={onDone}>
                  Done
                </Button>
              ) : (
                <Text flexShrink={0}>All done. End the round!</Text>
              )}
            </>
          )}
        </Stack>
      )}
    </Stack>
  );
}
