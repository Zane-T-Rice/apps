import { Box, Popover, Portal, Stack, Text } from "@chakra-ui/react";
import { ComponentType, ReactNode, useEffect, useRef } from "react";
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
  REST_PREFIX,
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
      // Strong is solid. Waning is the same color, lighter, with a dashed edge in the full color, so it
      // reads as on but fading. Inert has no fill and is dimmed.
      bg={
        elementState === "strong"
          ? `${color}.solid`
          : elementState === "waning"
            ? `${color}.muted`
            : undefined
      }
      color={elementState === "strong" ? `${color}.contrast` : undefined}
      opacity={elementState === "inert" ? 0.4 : 1}
      borderStyle={elementState === "waning" ? "dashed" : "solid"}
      borderWidth={elementState === "waning" ? "3px" : "1px"}
      borderColor={elementState === "waning" ? `${color}.solid` : undefined}
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
  // Each set of figures tied with each other, split into those that still need putting in order and
  // those that have been.
  const allTieGroups = Object.values(
    turns
      .filter((turn) => turn.tied)
      .reduce<Record<string, typeof turns>>((groups, turn) => {
        const key = `${turn.alignment}|${turn.initiative}|${turn.second}`;
        (groups[key] ??= []).push(turn);
        return groups;
      }, {}),
  );
  const tieGroups = allTieGroups.filter((group) => !group[0].tieChosen);
  // For the menu, in an order that does not change as the choices are made.
  const tieMembers = allTieGroups
    .map((group) => [...group].sort((a, b) => a.id.localeCompare(b.id)))
    .sort((a, b) => a[0].id.localeCompare(b[0].id));
  // A spawned turn or a late group says which standees go, since it is easy to lose track of which
  // ones in the group still have a turn to take.
  const turnName = (turn: (typeof turns)[number]) =>
    (turn.spawned || turn.late) && turn.numbers.length > 0
      ? `${turn.label} ${turn.numbers.join(", ")}`
      : turn.label;
  // Why a turn is where it is, when that is not just its initiative.
  const turnTag = (turn: (typeof turns)[number], index: number) => {
    const after = turns.find((other) => other.id === turn.afterId);
    if (turn.summon) return "Summon";
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
    // Not while a tie still needs its order chosen.
    if (tieGroups.length > 0) return;
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
    ELEMENTS.forEach((element) => {
      const elementState = getElementState(state, element);
      if (elementState === "strong") {
        entries.push([elementKey(element), "waning"]);
      } else if (elementState === "waning") {
        entries.push([elementKey(element), "inert"]);
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
          key.startsWith(REST_PREFIX) ||
          key.startsWith(SECOND_INITIATIVE_PREFIX))
      )
        entries.push([key, ""]);
    });
    saveState(entries);
  };

  // Choosing the order of a tie, or changing it. It opens over the page, so it takes no room of its
  // own, and it is shared by the button next to the round and the one that stands in for Done.
  const tieMenu = (
    trigger: ReactNode,
    placement: "bottom-start" | "bottom-end",
  ) => (
    <Popover.Root positioning={{ placement }}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Body>
              <Stack gap={4} minWidth="15rem">
                {tieMembers.map((members) => {
                  const placed = members.filter(
                    (turn) => turn.tieRank !== null,
                  );
                  return (
                    <Stack key={members[0].id} gap={2}>
                      <Text fontWeight="semibold">
                        {placed.length === members.length
                          ? "Tied. In this order"
                          : placed.length === 0
                            ? "Tied. Who goes first?"
                            : "Tied. Who goes next?"}
                      </Text>
                      {/* Everyone stays where they are and only changes look, so nothing moves
                                as the choices are made. */}
                      <Stack direction="row" gap={2} wrap="wrap">
                        {members.map((turn) => (
                          <Button
                            key={turn.id}
                            variant={turn.tieRank === null ? "outline" : "safe"}
                            disabled={turn.tieRank !== null}
                            onClick={() => {
                              const placement = planTieTap(
                                turns,
                                state,
                                turn.id,
                              );
                              if (placement.length > 0) saveState(placement);
                            }}
                          >
                            {turn.tieRank !== null && `${turn.tieRank} `}
                            {turnName(turn)}
                          </Button>
                        ))}
                      </Stack>
                      <Button
                        variant="outline"
                        alignSelf="start"
                        disabled={placed.length === 0}
                        onClick={() => {
                          // Pressing one that has a place starts the whole tie over.
                          const placement = planTieTap(
                            turns,
                            state,
                            placed[0].id,
                          );
                          if (placement.length > 0) saveState(placement);
                        }}
                      >
                        Start over
                      </Button>
                    </Stack>
                  );
                })}
              </Stack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );

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
        {allTieGroups.length > 0 &&
          tieMenu(
            <Button
              variant={tieGroups.length > 0 ? "caution" : "outline"}
              height={8}
            >
              Tied
            </Button>,
            "bottom-start",
          )}
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
            // Room above and below, since a scrolling strip clips whatever sticks out of it, such as
            // the outline of a focused chip.
            paddingY={1}
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
                    // Why it is where it is, for when it needs checking.
                    title={tag ?? undefined}
                    // Groups tied that still need putting in order are dashed. Once they are in order they
                    // look like any other, and tapping one still starts the tie over.
                    borderStyle={
                      turn.tied && !turn.tieChosen ? "dashed" : undefined
                    }
                    borderWidth={
                      turn.tied && !turn.tieChosen ? "2px" : undefined
                    }
                    // Only a turn that is over can be tapped, to bring it back. Ties are chosen and
                    // changed from the line above, where a tap can not happen by accident.
                    pointerEvents={turn.done ? "auto" : "none"}
                    tabIndex={turn.done ? 0 : -1}
                    aria-label={
                      turn.done ? `Bring back ${turn.label}'s turn` : undefined
                    }
                    onClick={() => {
                      if (turn.done) saveState([[doneKey(turn.id), ""]]);
                    }}
                  >
                    {turn.done && "✓ "}
                    {turnName(turn)}
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
            {waitingOn.length > 0 && (
              <Box flexShrink={0}>
                <Text color="fg.muted">
                  Waiting on {waitingOn.map((group) => group.label).join(", ")}
                </Text>
              </Box>
            )}
            {/* Room at the end, so the last chip is not flush with the edge when scrolled all the way
                there, where a pixel of rounding can cut it. */}
            <Box flexShrink={0} width={2} aria-hidden="true" />
          </Stack>
          {started && turns.length > 0 && (
            <>
              {lastDoneIndex !== -1 && (
                <Button variant="outline" flexShrink={0} onClick={onBack}>
                  Back
                </Button>
              )}
              {tieGroups.length > 0 ? (
                // Until the tie is chosen there is no going on, so this stands where Done is.
                tieMenu(
                  <Button variant="caution" flexShrink={0}>
                    Tied
                  </Button>,
                  "bottom-end",
                )
              ) : (
                // Nothing left to do this round once everyone has gone, so there is nothing to mark.
                <Button
                  variant="caution"
                  flexShrink={0}
                  disabled={activeIndex === -1}
                  onClick={onDone}
                >
                  Done
                </Button>
              )}
            </>
          )}
        </Stack>
      )}
    </Stack>
  );
}
