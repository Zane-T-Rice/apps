import { Grid, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import { Button } from "../recipes/button";

export const MINIMUM_INITIATIVE = -29;
export const MAXIMUM_INITIATIVE = 129;
// Where the first tap on a step button starts from.
const STARTING_INITIATIVE = 0;

const clamp = (initiative: number) =>
  Math.min(MAXIMUM_INITIATIVE, Math.max(MINIMUM_INITIATIVE, initiative));

// Type the number, or use small steps for the exact number and large ones to get close, which also
// covers items that move initiative by 10 or 30. Typed numbers save when the player is done
// (enter or leaving the field) so the other players never see a half typed number.
export function InitiativeStepper(props: {
  label: string;
  // What it is for, when it is not the initiative (the second card).
  title?: string;
  // The same on a narrow screen, where there is no room for the whole word.
  shortTitle?: string;
  value: string;
  onSave: (value: string) => void;
}) {
  const {
    label,
    title = "Initiative",
    shortTitle = "Init",
    value,
    onSave,
  } = props;
  // What is being typed. Null whenever nothing is, so the saved value shows (including changes
  // other players make).
  const [draft, setDraft] = useState<string | null>(null);

  const saved = parseInt(value);
  const initiative = isNaN(saved) ? null : saved;
  const step = (by: number) => {
    setDraft(null);
    onSave(`${clamp((initiative ?? STARTING_INITIATIVE) + by)}`);
  };

  const saveDraft = () => {
    if (draft === null) return;
    setDraft(null);
    // Emptying the field clears the initiative. Anything else that is not a number is dropped.
    if (draft === "") return onSave("");
    const typed = parseInt(draft);
    if (!isNaN(typed)) onSave(`${clamp(typed)}`);
  };

  const stepButton = (by: number) => (
    <Button
      key={by}
      aria-label={`${by < 0 ? "Lower" : "Raise"} ${label} ${title.toLowerCase()} by ${Math.abs(by)}`}
      variant="safe"
      height={10}
      paddingX={0}
      width="100%"
      minWidth={0}
      fontSize={{ base: "sm", sm: "md" }}
      disabled={
        initiative !== null &&
        (by < 0
          ? initiative <= MINIMUM_INITIATIVE
          : initiative >= MAXIMUM_INITIATIVE)
      }
      onClick={() => step(by)}
    >
      {by > 0 ? `+${by}` : by}
    </Button>
  );

  return (
    // Every part takes a share of the width and shrinks with it, so the row never wraps. The input
    // gets the most, since it holds the number.
    <Grid
      templateColumns="minmax(0, 2.4fr) repeat(2, minmax(0, 1fr)) minmax(0, 1.8fr) repeat(3, minmax(0, 1fr))"
      alignItems="center"
      gap={1}
      // As wide as it needs to be and no more, so a wide screen does not stretch it into big buttons
      // far apart. On a narrow one it is the width available.
      width="100%"
      maxWidth="24rem"
    >
      <Text
        fontWeight="semibold"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        title={title}
      >
        <Text as="span" hideBelow="sm">
          {title}
        </Text>
        <Text as="span" hideFrom="sm">
          {shortTitle}
        </Text>
      </Text>
      {stepButton(-10)}
      {stepButton(-1)}
      <Input
        aria-label={`${label} ${title.toLowerCase()}`}
        placeholder="--"
        inputMode="numeric"
        width="100%"
        minWidth={0}
        paddingX={1}
        height={10}
        textAlign="center"
        fontSize={{ base: "lg", sm: "xl" }}
        fontWeight="bold"
        value={draft ?? value}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          if (/^-?\d{0,3}$/.test(e.target.value)) setDraft(e.target.value);
        }}
        onBlur={saveDraft}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
      {stepButton(1)}
      {stepButton(10)}
      <Button
        aria-label={`Clear ${label} ${title.toLowerCase()}`}
        variant="caution"
        height={10}
        paddingX={0}
        width="100%"
        minWidth={0}
        visibility={initiative === null ? "hidden" : "visible"}
        onClick={() => {
          setDraft(null);
          onSave("");
        }}
      >
        ×
      </Button>
    </Grid>
  );
}
